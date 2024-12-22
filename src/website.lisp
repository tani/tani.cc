(defpackage #:website/src/website
  (:nicknames #:website)
  (:use #:cl))
(in-package #:website/src/website)

(defvar *channel* (make-instance 'chanl:channel))

(defun reload ()
  (chanl:send *channel* "reload"))

(defun sse-close ()
  (chanl:send *channel* nil))

(defvar *utf-8* (flex:make-external-format :utf-8 :eol-style :lf))
(defun sse-open ()
  (setf (hunchentoot:content-type*) "text/event-stream; charset=utf-8")
  (setf (hunchentoot:reply-external-format*) *utf-8*)
  (hunchentoot:no-cache)
  (let* ((str (hunchentoot:send-headers))
         (out (flexi-streams:make-flexi-stream str :external-format *utf-8*)))
    (do ((msg (chanl:recv *channel*)
              (chanl:recv *channel*)))
        ((not (open-stream-p str)))
      (alexandria:switch (msg :test #'string=)
        ("reload"
         (sse-server:send-event! out "message" msg)
         (finish-output out)
         (return))))))

;; --------------------------------------------------
;; 1. メインの Easy Acceptor
;; --------------------------------------------------
(defvar *main-app* (make-instance 'hunchentoot:easy-acceptor :port 4242))
(defvar *project-root* (asdf:system-source-directory "website"))

;; --------------------------------------------------
;; 2. メインハンドラ (既存)
;; --------------------------------------------------
(defvar *static-handler* (hunchentoot:create-folder-dispatcher-and-handler "/out/" (merge-pathnames #p"out/" *project-root*)))
(pushnew *static-handler* hunchentoot:*dispatch-table*)

;; --------------------------------------------------
;; 3. ロングポーリング用のハンドラを追加
;;    ここでは "/reload-endpoint" にアクセスが来たら handle-long-poll を呼ぶ
;; --------------------------------------------------
(hunchentoot:define-easy-handler (sse-handler :uri "/sse") ()
  (sse-open))

;; --------------------------------------------------
;; 4. サーバの起動/停止
;; --------------------------------------------------
(defun start ()
  (hunchentoot:start *main-app*))

(defun stop ()
  (hunchentoot:stop *main-app*))

;; --------------------------------------------------
;; 6. 静的ファイルを生成する関数 (既存)
;; --------------------------------------------------
(defun convert-markdown-to-html (md-string)
  (with-output-to-string (stream)
    (3bmd:parse-string-and-print-to-stream md-string stream)))

(defun extract-title (html-string)
  (let ((start (+ 4 (search "<h1>" html-string)))
        (end (search "</h1>" html-string)))
    (subseq html-string start end)))

(defun render-html-with-layout (html-string)
  (let* ((src-directory (merge-pathnames #p"src/" *project-root*))
         (layout-pathname (merge-pathnames #p"layout.mustache" src-directory))
         (layout-template (alexandria:read-file-into-string layout-pathname))
         (title-string (extract-title html-string))
         (context `((:article . ,html-string) (:title . ,title-string))))
    (with-output-to-string (stream)
      (mustache:render layout-template context stream))))

(defun generate ()
  (let* ((*project-root* (truename #p"."))
         (src-directory (merge-pathnames #p"src/" *project-root*))
         (out-directgory (merge-pathnames #p"out/" *project-root*)))
    (dolist (src-pathname (uiop:directory-files src-directory))
      (let ((src-name (pathname-name src-pathname))
            (src-type (pathname-type src-pathname)))
        (if (string= src-type "md")
            (let* ((src-string (alexandria:read-file-into-string src-pathname))
                   (html-string (convert-markdown-to-html src-string))
                   (out-string (render-html-with-layout html-string))
                   (out-pathname (make-pathname :name src-name
                                                :type "html"
                                                :directory (namestring out-directgory))))
              (ensure-directories-exist (make-pathname :directory (pathname-directory out-pathname)))
              (alexandria:write-string-into-file out-string out-pathname :if-exists :overwrite))
            (let ((out-pathname (make-pathname :name src-name
                                               :type src-type
                                               :directory (namestring out-directgory))))
              (ensure-directories-exist (make-pathname :directory (pathname-directory out-pathname)))
              (alexandria:copy-file src-pathname out-pathname)))))))

;; --------------------------------------------------
;; 7. メイン関数 (既存)
;; --------------------------------------------------
(defun main ()
  (let ((command (car (uiop:command-line-arguments))))
    (cond ((string= command "serve") (start) (read) (stop))
          ((string= command "generate") (generate))
          (t (format t "Usage: <executable> [serve|generate]~%")))))
