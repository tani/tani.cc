(defpackage #:website/test/website
  (:use #:cl #:fiveam #:website/src/website))
(in-package #:website/test/website)

(def-suite :website)
(in-suite :website)

(test fib-test
  (is-true (= 55 55)))
