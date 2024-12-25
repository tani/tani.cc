(defpackage #:website/src/website
  (:nicknames #:website)
  (:use #:cl #:website/src/generator #:website/src/server)
  (:export #:main))
(in-package #:website/src/website)

(defun main ()
  (let ((command (car (uiop:command-line-arguments))))
    (alexandria:switch (command :test #'string=)
      ("serve" (server:serve))
      ("generate" (let ((generator:*development* nil)) (generator:generate)))
      (t (format t "Usage: <executable> [serve|generate]~%")))))
