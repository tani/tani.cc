(defpackage #:website/src/website
  (:nicknames #:website)
  (:use #:cl #:website/src/generator #:website/src/server))
(in-package #:website/src/website)

(defun main ()
  (let ((command (car (uiop:command-line-arguments))))
    (alexandria:switch (command :test #'string=)
      ("serve" (serve))
      ("generate" (let ((*production* t)) (generate)))
      (t (format t "Usage: <executable> [serve|generate]~%")))))
