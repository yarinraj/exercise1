FROM gcc:latest
RUN apt-get update && apt-get install -y cmake
WORKDIR /usr/src/app
COPY . .

RUN git clone https://github.com/google/googletest.git /usr/src/gtest && \
    cd /usr/src/gtest && cmake . && make && cp -r googletest/include/. /usr/include && \
    cp -r googlemock/include/. /usr/include && cp lib/*.a /usr/lib

RUN make
CMD ["./main.out"]