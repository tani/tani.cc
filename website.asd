(defsystem #:website
  :class :package-inferred-system
  :version "0.1.0"
  :build-operation program-op
  :entry-point "website/src/website:main"
  :depends-on (#:alexandria
               #:cl-mustache
               #:3bmd
               #:hunchentoot
               #:clack
               #:clack-handler-hunchentoot
               #:website/src/website)
  :in-order-to ((test-op (test-op #:website/test))))

(defsystem #:website/test
  :depends-on (#:fiveam #:website/test/website)
  :perform (test-op (o c)
             (symbol-call :fiveam :run! :website)))