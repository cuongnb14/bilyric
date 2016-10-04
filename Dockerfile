# Author: Cuong Nguyen
#
# Build: docker build -t cuongnb14/bilyric:0.1 .
# Run: docker run -d -p 8080:8080 --name bilyric_server cuongnb14/bilyric:0.1 .
#

FROM ubuntu:16.04
MAINTAINER Cuong Nguyen "cuongnb14@gmail.com"


ENV DB_NAME bilyric
ENV DB_USER root
ENV DB_PASS root
ENV DB_HOST 172.17.0.1
ENV DB_PORT 3306

RUN apt-get update -qq

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y python3 python3-pip build-essential python3-dev

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y libmysqlclient-dev \
        libxml2-dev libxslt1-dev

RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN pip3 install -r requirements/local.txt
RUN pip3 install -r requirements/production.txt

EXPOSE 8000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
