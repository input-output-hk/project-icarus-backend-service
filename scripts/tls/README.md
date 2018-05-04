# About

This script allows to create a self signed cert to be used in dev enviroment to allow
HTTPS connections.

# How to run

1.  Execute `bash ./tls.sh`

* When asked for _Common Name_ insert localhost

2.  Update chrome
    1.  chrome://settings/certificates?search=ssl
    2.  authorities > import 
    3.  Select ca.pem

3. Restart chrome
