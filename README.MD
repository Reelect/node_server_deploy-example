# node_server_deploy-example

Reference: [Bootstrapping Microservices](https://www.bootstrapping-microservices.com)

현재 원본 교재의 Ch.4까지 구현된 상태입니다. 저만의 환경을 위한 형태로 코드도 원본과 좀 다릅니다.

**구성요소**

1. Video 접속용 컨테이너
   - Cloud Storage, Local DB와 연결과 사용자의 요청을 관리
2. Storage 컨테이너
   - 현재는 Azure Cloud에 저장된 비디오를 가져와 사용자 접속용 컨테이너에 전송해주는 역할
3. Mongo DB 컨테이너
   - 1.의 접속용 컨테이너가 id -> viedo path 형식으로 저장된 데이터를 조회하여, 사용자가 id를 지정해서 쿼리를 보내면, 그에 상응하는 비디오를 2. Storage 컨테이너에 요청하여 비디오를 받아오는 과정 수행

**_Docker compse yaml 파일의 환경변수를 본인의 환경에 맞게 작성 후, 아래의 코드를 실시해야합니다._**

Present initializing code:

    docker-compose up --build

When you off this service:

    docker-compose stop && docker-compose down
