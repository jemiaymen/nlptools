FROM tensorflow/tensorflow

LABEL maintainer="jemiaymen@gmail.com"

RUN mkdir /code

WORKDIR /code

RUN pip install pandas sqlitedict fastapi uvicorn PyYAML

ADD . /code


COPY run.sh /usr/local/bin/

RUN chmod u+x /usr/local/bin/run.sh

EXPOSE 80

ENTRYPOINT ["run.sh"]