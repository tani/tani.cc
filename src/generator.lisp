(defpackage #:website/src/generator
  (:nicknames #:generator)
  (:use #:cl)
  (:export generate))
(in-package #:website/src/generator)

(defvar *project-root* (asdf:system-source-directory "website"))

(defvar *production* nil)

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
         (context `((:article . ,html-string)
                    (:title . ,title-string)
                    (:production . ,*production*))))
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
              (alexandria:write-string-into-file out-string out-pathname :if-exists :supersede :if-does-not-exist :create))
            (let ((out-pathname (make-pathname :name src-name
                                               :type src-type
                                               :directory (namestring out-directgory))))
              (ensure-directories-exist (make-pathname :directory (pathname-directory out-pathname)))
              (alexandria:copy-file src-pathname out-pathname)))))))
