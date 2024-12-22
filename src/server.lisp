(defpackage #:website/src/server
  (:nicknames #:server)
  (:use #:cl)
  (:export serve reload start stop))
(in-package #:website/src/server)

(defvar *channel* (make-instance 'chanl:channel))

(defvar *utf-8* (flex:make-external-format :utf-8 :eol-style :lf))

(defvar *main-app* (make-instance 'hunchentoot:easy-acceptor :port 4242))

(defvar *project-root* (asdf:system-source-directory "website"))

(defvar *static-handler* (hunchentoot:create-folder-dispatcher-and-handler "/out/" (merge-pathnames #p"out/" *project-root*)))

(pushnew *static-handler* hunchentoot:*dispatch-table*)

(hunchentoot:define-easy-handler (sse-handler :uri "/sse") ()
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

(defun start ()
  (hunchentoot:start *main-app*))

(defun stop ()
  (hunchentoot:stop *main-app*))

(defun reload ()
  (chanl:send *channel* "reload"))

(defun serve()
  (start)
  (read)
  (stop))
