FROM nikolaik/python-nodejs:python3.7-nodejs15

LABEL maintainer="jemiaymen@gmail.com"

RUN mkdir /code

WORKDIR /code

RUN pip install pandas sqlitedict fastapi uvicorn python-multipart

ADD . /code

WORKDIR /code/ui

RUN npm install

COPY run.sh /usr/local/bin/

RUN chmod u+x /usr/local/bin/run.sh

EXPOSE 3000

ENTRYPOINT ["run.sh"]