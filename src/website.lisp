(defpackage #:website/src/website
  (:nicknames #:website)
  (:use #:cl)
  (:export #:main))
(in-package #:website/src/website)

(defvar *project-root* (asdf:system-source-directory "website"))

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

(defun normalize-path (path)
  (cond ((alexandria:ends-with-subseq "/" path)
         (format nil ".~aindex.md" path))
        ((alexandria:ends-with-subseq ".html" path)
         (format nil ".~a.md" (subseq path 0 (- (length path) 5))))
        (t (format nil ".~a" path))))

(defun detect-content-type (path)
  (cond ((alexandria:ends-with-subseq ".html" path) "text/html")
        ((alexandria:ends-with-subseq ".css" path) "text/css")
        ((alexandria:ends-with-subseq ".js" path) "text/javascript")))

(defun server-app (env)
  (let* ((path (getf env :path-info))
         (*project-root* (truename #p"."))
         (src-directory (merge-pathnames (merge-pathnames #p"src/" *project-root*)))
         (src-pathname (merge-pathnames (normalize-path path) src-directory)))
    (if (probe-file src-pathname)
        (let* ((src-string (alexandria:read-file-into-string src-pathname))
               (html-string (convert-markdown-to-html src-string))
               (out-string (render-html-with-layout html-string))
               (out-content-type (detect-content-type path)))
          `(200 (:content-type ,out-content-type) (,out-string)))
        '(404 (:content-type "text/plain") ("Not found")))))

(defun serve ()
  (let ((handler (clack:clackup #'server-app)))
    (read)
    (clack:stop handler)))

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
                 (out-pathname (make-pathname :name src-name :type "html" :directory (namestring out-directgory))))
            (ensure-directories-exist (make-pathname :directory (pathname-directory out-pathname)))
            (alexandria:write-string-into-file out-string out-pathname :if-exists :overwrite))
          (let ((out-pathname (make-pathname :name src-name :type src-type :directory (namestring out-directgory))))
            (ensure-directories-exist (make-pathname :directory (pathname-directory out-pathname)))
            (alexandria:copy-file src-pathname out-pathname)))))))

(defun main ()
  (let ((command (car (uiop:command-line-arguments))))
    (cond ((string= command "serve") (serve))
          ((string= command "generate") (generate)))))