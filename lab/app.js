const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const block=(name,code)=>`<div class="code-wrap"><div class="code-head"><span>${name}</span><button class="copy" type="button">복사</button></div><pre><code>${esc(code)}</code></pre></div>`;
const note=s=>`<div class="note">${s}</div>`;
const compose=`services:
  gitea:
    image: gitea/gitea:1
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      GITEA__server__ROOT_URL: http://localhost:3000/
      GITEA__webhook__ALLOWED_HOST_LIST: jenkins
    volumes:
      - gitea_data:/data
  jenkins:
    build:
      context: .
      dockerfile: Dockerfile.jenkins
    user: root
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - jenkins_data:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
volumes:
  gitea_data:
  jenkins_data:`;
const dockerfile=`FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B clean verify
RUN cp target/*.jar /workspace/app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/app.jar app.jar
USER 10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`;
const pipeline=`pipeline {
  agent any
  options { disableConcurrentBuilds() }
  triggers { pollSCM('H/2 * * * *') }
  stages {
    stage('Test') {
      steps {
        sh 'docker build --target build -t cicd-demo-test:$BUILD_NUMBER .'
      }
    }
    stage('Image') {
      steps {
        sh 'docker build -t cicd-demo:$BUILD_NUMBER .'
      }
    }
    stage('Deploy') {
      steps {
        sh '''
          if docker container inspect cicd-demo >/dev/null 2>&1; then
            docker rm -f cicd-demo
          fi
          docker run -d --name cicd-demo \\
            -p 8081:8080 cicd-demo:$BUILD_NUMBER
        '''
      }
    }
    stage('Check') {
      steps {
        sh '''
          curl --fail --retry 12 --retry-delay 5 \\
            --retry-connrefused --max-time 10 \\
            http://host.docker.internal:8081/hello
        '''
      }
    }
  }
}`;
const lessons=[
{title:'CI/CD 큰 그림 이해하기',short:'전체 흐름 이해',desc:'네 가지 도구의 역할과 자동 배포의 원리를 알아봅니다.',body:()=>`<p>매번 파일을 복사하고 서버를 다시 켜는 대신, 반복되는 일을 정해진 순서로 자동 실행하도록 만듭니다. 이번 실습의 결과는 <strong>코드 변경 → 자동 테스트 → 새 컨테이너 실행</strong>입니다.</p><h3>네 도구는 각각 무슨 일을 할까요?</h3><table><tr><th>도구</th><th>쉬운 비유</th><th>실제 역할</th></tr><tr><td>Spring Boot</td><td>우리가 만드는 제품</td><td>HTTP 요청에 응답하는 Java 웹 앱</td></tr><tr><td>Gitea</td><td>설계도 보관함</td><td>Git 저장소와 코드 변경 이력 관리</td></tr><tr><td>Jenkins</td><td>작업 순서를 지키는 자동화 담당자</td><td>소스 확인, 테스트, 빌드, 배포 실행</td></tr><tr><td>Docker</td><td>실행 환경까지 담은 상자</td><td>이미지를 만들고 컨테이너로 실행</td></tr></table><h3>CI와 CD를 구분해 보기</h3><p><strong>CI(지속적 통합)</strong>는 변경된 코드가 기존 코드와 잘 어울리는지 빌드와 테스트로 자주 확인하는 과정입니다. <strong>Continuous Delivery</strong>는 언제든 배포할 수 있는 상태를 유지하며 최종 승인을 둘 수 있습니다. <strong>Continuous Deployment</strong>는 검증을 통과한 변경을 자동 배포합니다. 이 실습은 학습용 로컬 환경에 자동 배포합니다.</p><h3>이 가이드의 실습 경로</h3><ol><li>Spring Initializr로 작은 Java 앱을 만듭니다.</li><li>Gitea에 코드를 올리고 Jenkins가 저장소를 읽도록 연결합니다.</li><li>먼저 수동 실행으로 성공을 확인한 뒤 약 2분 간격 변경 감지를 사용합니다.</li><li>코드 한 줄을 바꿔 올리고 응답이 자동 변경되는지 확인합니다.</li></ol>${note('기본 과정은 설정이 단순한 SCM 폴링을 사용합니다. 웹훅은 마지막 단계에서 확장 방식으로 설명합니다. 폴링은 Jenkins가 확인하러 가는 방식, 웹훅은 Gitea가 변경을 알려주는 방식입니다.')}<h3>실습 범위</h3><p>한 대의 개인 PC에서 학습합니다. 회사 운영 서버 구축이나 무중단 배포까지 포함하지 않습니다. 홈페이지의 파이프라인 그림은 개념 설명이며, 사용자의 Docker를 직접 조작하지 않습니다.</p>`},
{title:'실습 환경 준비하기',short:'실습 환경 준비',desc:'Docker Desktop과 두 서버를 실행하고 주소를 확인합니다.',body:()=>`<p>Windows에서 Docker Desktop을 설치하고 <strong>Linux 컨테이너</strong> 모드로 실행합니다. Git, JDK 21, 코드 편집기도 준비하세요. 예제는 Maven과 Java 21을 사용합니다.</p><p><a href="https://docs.docker.com/desktop/setup/install/windows-install/" target="_blank" rel="noopener">Docker Desktop 설치 안내 ↗</a> · <a href="https://git-scm.com/downloads" target="_blank" rel="noopener">Git 설치 ↗</a> · <a href="https://adoptium.net/temurin/releases/?version=21" target="_blank" rel="noopener">JDK 21 ↗</a></p><h3>1. PowerShell에서 설치 확인</h3>${block('PowerShell',`docker version
docker compose version
git --version
java -version`)}<p>Docker 명령에는 Client와 Server 정보가 모두 보여야 합니다. Server 연결 오류는 Docker Desktop이 아직 준비되지 않았다는 뜻일 수 있습니다.</p><h3>2. 실습 폴더에 두 파일 만들기</h3><p><code>cicd-practice</code> 폴더를 만들고 아래 두 파일을 같은 위치에 저장합니다. 앱 코드는 다음 단계에서 하위 <code>demo</code> 폴더에 둡니다.</p>${block('Dockerfile.jenkins',`FROM jenkins/jenkins:lts-jdk21
USER root
RUN apt-get update \\
    && apt-get install -y --no-install-recommends docker.io curl \\
    && rm -rf /var/lib/apt/lists/*
USER jenkins`)}${block('compose.yaml',compose)}${note('개인 PC 전용 실습 구성입니다. Jenkins를 root로 실행하고 Docker 소켓을 연결하므로 Jenkins 작업은 호스트 컨테이너를 제어할 수 있습니다. 신뢰하는 본인 코드만 실행하세요. 운영에서는 전용 빌드 에이전트와 권한 분리가 필요합니다. 이미지 태그는 가변 태그이므로 재현성이 필요하면 검증한 버전 또는 digest로 고정합니다.')}<h3>3. 서버 시작하기</h3>${block('PowerShell · cicd-practice 폴더',`docker compose up -d --build
docker compose ps
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`)}<p>마지막 명령의 값을 Jenkins 첫 화면에 입력합니다. 권장 플러그인을 설치하고 관리자 계정을 만드세요. Pipeline, Git 플러그인이 설치되어 있는지 확인합니다.</p><table><tr><th>대상</th><th>내 PC 브라우저 주소</th><th>컨테이너 내부에서의 주소</th></tr><tr><td>Gitea</td><td>http://localhost:3000</td><td>http://gitea:3000</td></tr><tr><td>Jenkins</td><td>http://localhost:8080</td><td>http://jenkins:8080</td></tr><tr><td>배포한 앱</td><td>http://localhost:8081/hello</td><td>http://host.docker.internal:8081/hello</td></tr></table>${note('컨테이너의 localhost는 그 컨테이너 자신입니다. Jenkins에서 Gitea를 찾을 때 localhost:3000이 아니라 gitea:3000을 사용합니다. host.docker.internal은 여기서 Docker Desktop 호스트를 가리킵니다.')}<p>Gitea 첫 설치 화면에서는 데이터베이스를 SQLite3로 선택하고 기본 경로를 유지합니다. 서버 도메인은 localhost, 기본 URL은 http://localhost:3000/으로 설정하고 관리자 계정을 생성합니다.</p>`},
{title:'Spring Boot 웹 앱 만들기',short:'Spring Boot 앱',desc:'작은 API와 테스트를 만들고 Docker 이미지로 묶습니다.',body:()=>`<p><a href="https://start.spring.io" target="_blank" rel="noopener">Spring Initializr ↗</a>에서 프로젝트를 생성합니다. Maven · Java · Java 21 · Jar를 선택하고, Spring Boot는 Java 21을 지원하는 정식 버전(SNAPSHOT·M 제외)을 고릅니다. Group은 <code>com.example</code>, Artifact는 <code>demo</code>, Package name은 <code>com.example.demo</code>, Dependency는 <strong>Spring Web</strong>을 선택합니다.</p><p>Generate로 내려받은 압축을 <code>cicd-practice/demo</code>에 풉니다. <code>pom.xml</code>, <code>mvnw.cmd</code>, <code>src</code>가 demo 바로 아래 있어야 합니다. 생성된 Application 클래스는 유지하세요.</p><h3>1. 응답을 보내는 컨트롤러 추가</h3>${block('src/main/java/com/example/demo/HelloController.java',`package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello CI/CD v1";
    }
}`)}<p><code>@RestController</code>는 반환값을 HTTP 응답 본문으로 보냅니다. <code>@GetMapping("/hello")</code>는 해당 주소의 GET 요청을 아래 메서드에 연결합니다.</p><h3>2. 실제 검증하는 테스트 추가</h3>${block('src/test/java/com/example/demo/HelloControllerTest.java',`package com.example.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HelloControllerTest {
    @Test
    void greetingStartsWithExpectedText() {
        String result = new HelloController().hello();
        assertTrue(result.startsWith("Hello CI/CD"));
    }
}`)}<p>문구의 시작을 검증하는 단위 테스트입니다. 생성된 애플리케이션 시작 테스트도 유지합니다. 전체 HTTP 통신 검증은 배포 후 Check 단계에서 수행합니다.</p>${block('PowerShell · demo 폴더',`.\\mvnw.cmd test
.\\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--server.port=9090`)}<p><code>http://localhost:9090/hello</code>에서 Hello CI/CD v1을 확인합니다. Jenkins가 8080을 사용하므로 로컬 실행은 9090입니다. 확인 후 Ctrl+C로 종료합니다.</p><h3>3. 앱 폴더에 Dockerfile 추가</h3>${block('demo/Dockerfile',dockerfile)}<p><strong>앞부분은 빌드 공간</strong>입니다. 소스와 pom.xml을 복사하고 <code>mvn clean verify</code>로 테스트와 패키징을 수행합니다. <strong>뒷부분은 실행 공간</strong>입니다. 완성된 JAR만 가져와 일반 사용자로 Java를 실행합니다. EXPOSE는 포트 설명이며 외부 연결은 -p 옵션이 담당합니다.</p>${block('demo/.dockerignore',`target
.git
.idea
*.log`)}${block('PowerShell · demo 폴더',`docker build -t cicd-demo:manual .
docker run -d --name cicd-demo-manual -p 127.0.0.1:9091:8080 cicd-demo:manual`)}<p><code>http://localhost:9091/hello</code>로 확인합니다. 실습 종료 시 <code>docker rm -f cicd-demo-manual</code>로 이 확인용 컨테이너만 제거할 수 있습니다.</p>`},
{title:'Gitea에 소스 코드 올리기',short:'Gitea 저장소',desc:'첫 커밋과 push를 하고 Jenkins용 읽기 권한을 준비합니다.',body:()=>`<p>Gitea는 내 PC에서 운영하는 Git 저장소 서비스입니다. <strong>커밋</strong>은 변경 기록을 남기는 일이고, <strong>push</strong>는 그 기록을 원격 저장소에 올리는 일입니다.</p><h3>1. 비어 있는 저장소 만들기</h3><ol><li>브라우저에서 <code>http://localhost:3000</code>에 접속해 로그인합니다.</li><li>새 저장소를 선택하고 이름을 <code>demo</code>로 입력합니다.</li><li>비공개 저장소로 만들고 README 자동 초기화는 해제합니다. 로컬 앱에서 첫 커밋을 올릴 예정입니다.</li></ol><h3>2. Git으로 첫 코드 올리기</h3><p>아래 <code>YOUR_USER</code>를 실제 Gitea 계정명으로 바꿉니다. 이메일과 이름도 본인의 값으로 설정합니다.</p>${block('PowerShell · demo 폴더',`git init
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git commit -m "Create Spring Boot demo"
git branch -M main
git remote add origin http://localhost:3000/YOUR_USER/demo.git
git push -u origin main`)}<p>인증 창에는 Gitea 계정을 사용합니다. 개인 접근 토큰을 사용하는 경우 비밀번호 대신 토큰을 입력하세요. 토큰을 원격 URL이나 소스 코드에 넣지 않습니다.</p><h3>3. 업로드 결과 확인</h3><p>Gitea 저장소에서 <code>pom.xml</code>, <code>src</code>, <code>Dockerfile</code>이 보이고 브랜치가 main인지 확인합니다. 비밀번호나 개인 키가 포함된 파일은 올리지 않습니다. 생성된 .gitignore도 함께 유지하세요.</p><h3>4. Jenkins에 저장소 인증 등록</h3><p>Gitea의 사용자 설정 → Applications에서 토큰을 만듭니다. 설치 버전에서 지원하는 권한 옵션으로 대상 저장소의 읽기에 필요한 최소 권한만 부여하세요. Jenkins의 Manage Jenkins → Credentials → System → Global credentials → Add Credentials로 이동합니다.</p><table><tr><th>입력 항목</th><th>값</th></tr><tr><td>Kind</td><td>Username with password</td></tr><tr><td>Username</td><td>Gitea 계정명</td></tr><tr><td>Password</td><td>Gitea 접근 토큰</td></tr><tr><td>ID</td><td>gitea-read</td></tr></table>${note('내 PC에서 push할 주소는 localhost:3000, Jenkins가 clone할 주소는 gitea:3000입니다. 주소만 다르고 같은 저장소를 가리킵니다.')}<p>이 단계의 성공 기준: Gitea 웹 화면에서 방금 올린 커밋과 파일을 볼 수 있습니다.</p>`},
{title:'Jenkins 자동화 연결하기',short:'Jenkins 파이프라인',desc:'저장소의 Jenkinsfile로 테스트부터 배포까지 연결합니다.',body:()=>`<p>Jenkinsfile은 자동화 작업 순서를 적은 파일입니다. 앱의 <code>pom.xml</code>과 같은 위치에 저장합니다. 이 예제는 Docker CLI를 직접 실행하므로 별도 Docker Pipeline 플러그인은 필요하지 않습니다.</p>${block('demo/Jenkinsfile',pipeline)}<h3>각 단계가 하는 일</h3><ol><li><strong>Test:</strong> Dockerfile의 build 단계까지만 실행합니다. Maven 테스트가 실패하면 이후 배포를 진행하지 않습니다.</li><li><strong>Image:</strong> 테스트한 빌드 결과를 바탕으로 실행 이미지를 만듭니다. 같은 빌드 단계는 Docker 캐시를 재사용할 수 있습니다.</li><li><strong>Deploy:</strong> 기존 cicd-demo 컨테이너가 있으면 제거하고 새 이미지로 실행합니다. 이미지 태그에 빌드 번호를 넣어 구분합니다.</li><li><strong>Check:</strong> 앱이 응답할 때까지 재시도합니다. HTTP 오류나 연결 실패가 계속되면 빌드가 실패합니다.</li></ol>${note('학습용 교체 배포이므로 짧은 중단 시간이 있습니다. Check 실패 시 자동 롤백하지 않습니다. 앱 포트 8081은 Docker Desktop 외부에도 노출될 수 있으므로 개인 실습망에서 사용하고, 외부 공유 시 방화벽과 접근 제어를 먼저 구성하세요.')}<h3>1. 파일을 저장소에 반영</h3>${block('PowerShell · demo 폴더',`git add Jenkinsfile
git commit -m "Add CI/CD pipeline"
git push`)}<h3>2. Jenkins 작업 생성</h3><ol><li>Jenkins 홈 → New Item → 이름 <code>demo-pipeline</code> → <strong>Pipeline</strong> 선택.</li><li>Pipeline의 Definition을 <strong>Pipeline script from SCM</strong>으로 변경하고 SCM은 Git 선택.</li><li>Repository URL에 <code>http://gitea:3000/YOUR_USER/demo.git</code> 입력.</li><li>Credentials는 <code>gitea-read</code>, Branch Specifier는 <code>*/main</code> 설정.</li><li>Script Path는 <code>Jenkinsfile</code>로 두고 Save.</li><li><strong>Build Now</strong>를 처음 한 번 실행하고 빌드 번호 → Console Output을 확인합니다.</li></ol><p>기본 실습은 Jenkins 내장 노드에서 실행됩니다. 대기 상태라면 Manage Jenkins → Nodes에서 built-in node의 executor가 1 이상인지 확인하세요. 이 방식은 개인 학습 전용이며 운영 작업은 전용 agent로 옮깁니다.</p><h3>성공을 확인하는 세 곳</h3><ul><li>Jenkins 콘솔 마지막: <code>Finished: SUCCESS</code></li><li>PowerShell의 <code>docker ps</code>: cicd-demo가 실행 중</li><li>브라우저 <code>http://localhost:8081/hello</code>: Hello CI/CD v1</li></ul><p>테스트 보고서는 이 간단한 구성에서는 Docker 빌드 로그로 확인합니다. 별도의 JUnit 리포트 수집은 추가 확장 항목입니다.</p>`},
{title:'변경부터 자동 배포까지 확인',short:'배포 확인·다음 단계',desc:'문구를 바꾸고 자동 배포를 확인한 뒤 웹훅으로 확장합니다.',body:()=>`<h3>1. 코드 한 줄 변경하기</h3><p>HelloController의 <code>Hello CI/CD v1</code>을 <code>Hello CI/CD v2</code>로 변경합니다. 테스트가 검증하는 앞부분은 유지합니다.</p>${block('PowerShell · demo 폴더',`git add src/main/java/com/example/demo/HelloController.java
git commit -m "Update greeting to v2"
git push`)}<h3>2. 자동 실행 기다리기</h3><p>Jenkinsfile의 <code>pollSCM('H/2 * * * *')</code>는 약 2분 간격으로 변경을 확인합니다. 첫 수동 빌드를 거친 뒤 적용됩니다. 스케줄 분산과 실행 대기열에 따라 실제 시작 시점은 달라집니다. 새 커밋이 없으면 새 빌드를 만들지 않습니다.</p><p>새 빌드가 성공한 뒤 <code>http://localhost:8081/hello</code>를 새로고침합니다. <strong>Hello CI/CD v2</strong>가 보이면 코드 변경부터 배포까지의 연결에 성공한 것입니다.</p><h3>3. 실패도 한 번 경험해 보기</h3><p>별도 학습 커밋에서 테스트의 기대값을 맞지 않게 바꿔 보세요. Test 단계가 실패하고 Deploy로 넘어가지 않아 이전 컨테이너가 계속 실행되는지 확인합니다. 확인한 뒤 테스트를 원상 복구하여 다시 커밋합니다.</p><h3>폴링에서 웹훅으로 확장하려면?</h3><p>웹훅은 Gitea가 push 이벤트를 Jenkins에 즉시 전달합니다. 이 사이트의 기본 Pipeline 설정과는 별도의 확장 과정입니다. <a href="https://plugins.jenkins.io/gitea/" target="_blank" rel="noopener">Jenkins Gitea 플러그인 공식 안내</a>에 따라 서버와 인증을 등록하고 Gitea 기반 Multibranch Pipeline을 구성합니다. 플러그인 방식에 맞춰 웹훅을 생성하고, Gitea의 전달 기록과 Jenkins 빌드 시작을 함께 확인하세요.</p>${note('단순히 임의의 웹훅 URL을 넣으면 동작하지 않습니다. 플러그인, 작업 유형, 이벤트와 인증이 맞아야 합니다. Gitea 컨테이너에서 Jenkins는 http://jenkins:8080으로 접근하며, Compose 예제는 웹훅 허용 호스트를 jenkins로 제한합니다. 웹훅이 정상 작동한 뒤 중복 트리거를 막으려면 pollSCM을 제거합니다.')}<h3>문제가 생기면 이전 이미지로 수동 복구</h3><p>PowerShell에서 <code>docker images cicd-demo</code>로 이전 성공 태그를 찾습니다. 아래 3은 예시이며 실제 성공 빌드 번호로 바꾸세요. 현재 앱을 교체하므로 잠깐 중단됩니다.</p>${block('PowerShell · 예: 이전 성공 빌드 번호가 3인 경우',`docker rm -f cicd-demo
docker run -d --name cicd-demo -p 8081:8080 cicd-demo:3`)}<h3>실습을 마칠 때</h3>${block('PowerShell · cicd-practice 폴더',`docker compose stop
docker stop cicd-demo`)}<p>이 명령은 데이터를 지우지 않고 중지합니다. 다시 학습할 때 <code>docker compose start</code>와 <code>docker start cicd-demo</code>를 실행하세요.</p><h3>다음 학습 목표</h3><ul><li>전용 Jenkins agent에서 빌드하고 운영 서버를 분리하기</li><li>컨테이너 레지스트리에 이미지를 저장하고 digest로 추적하기</li><li>HTTPS·비밀정보 관리·최소 권한 적용하기</li><li>배포 승인, 헬스체크, 자동 롤백 구성하기</li></ul>`}
];
const faqs=[['Docker daemon에 연결할 수 없어요.','Docker Desktop이 실행 중이며 Linux 컨테이너 모드인지 확인합니다. PowerShell의 docker version에서 Server 정보가 보여야 합니다. Jenkins에서만 실패한다면 compose.yaml의 Docker 소켓 연결과 Jenkins 이미지에 Docker CLI가 설치되었는지 확인하세요.'],['Jenkins에서 Gitea 저장소를 찾지 못해요.','Repository URL에 localhost 대신 http://gitea:3000/YOUR_USER/demo.git을 사용하세요. docker compose ps로 두 서비스가 실행 중인지 확인하고, 같은 Compose 프로젝트의 네트워크인지 확인합니다.'],['401/403 또는 인증 실패가 나와요.','gitea-read 인증의 사용자명과 토큰을 확인합니다. 토큰이 만료되었거나 해당 비공개 저장소의 읽기 권한이 없을 수 있습니다. 토큰을 새로 발급했다면 Jenkins Credentials도 갱신하세요.'],['8080 또는 8081 포트를 이미 사용 중이라고 나와요.','docker ps로 기존 컨테이너를 확인합니다. 다른 앱을 무작정 종료하지 말고 호스트 포트를 변경하세요. Jenkins는 Compose의 왼쪽 포트, 앱은 Jenkinsfile의 -p 왼쪽 포트와 Check URL을 함께 변경해야 합니다.'],['push했는데 빌드가 시작되지 않아요.','첫 Build Now를 실행했는지, Jenkinsfile이 main에 있는지, Poll SCM 설정이 반영되었는지 확인하세요. 약 2분 간격 검사이므로 잠시 기다립니다. SCM Polling Log와 저장소 인증 오류를 확인하고, 웹훅 방식이라면 전달 기록을 별도로 확인합니다.'],['빌드는 성공했는데 화면이 안 열려요.','docker ps -a로 cicd-demo 상태를 보고 docker logs cicd-demo로 앱 시작 오류를 확인합니다. Dockerfile EXPOSE만으로는 포트가 공개되지 않습니다. -p 8081:8080 매핑과 브라우저 주소 /hello를 확인하세요.'],['테스트 실패와 배포 후 확인 실패는 어떻게 다른가요?','Test 단계 실패는 새 배포 전에 멈춥니다. Check 단계 실패는 이미 새 컨테이너로 교체한 이후입니다. 이 실습에는 자동 롤백이 없으므로 로그를 확인한 뒤 이전 성공 이미지로 수동 복구해야 합니다.']];
const sources=[['Spring Boot + Docker','https://spring.io/guides/gs/spring-boot-docker/'],['Jenkins Docker 설치','https://www.jenkins.io/doc/book/installing/docker/'],['Jenkins Pipeline 문법','https://www.jenkins.io/doc/book/pipeline/syntax/'],['Gitea 웹훅','https://docs.gitea.com/usage/repository/webhooks/'],['Gitea Jenkins 플러그인','https://plugins.jenkins.io/gitea/'],['Docker 컨테이너 보기','https://docs.docker.com/desktop/use-desktop/container/']];
let completed=[];try{const saved=JSON.parse(localStorage.getItem('cicd-lab-progress')||'[]');if(Array.isArray(saved))completed=saved.filter(n=>Number.isInteger(n)&&n>=0&&n<6);}catch{}
let selected=0;let toastTimer;const toast=s=>{const t=document.querySelector('#toast');t.textContent=s;t.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.style.display='none',2400)};
const update=()=>{document.querySelector('#progress').value=completed.length;document.querySelector('#progress-text').textContent=`${completed.length} / 6`;document.querySelector('#lesson-nav').innerHTML=lessons.map((l,i)=>`<button class="${i===selected?'active':''}" aria-current="${i===selected?'step':'false'}" data-step="${i}"><span>${completed.includes(i)?'✓':String(i+1).padStart(2,'0')}</span>${l.short}</button>`).join('');document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>show(+b.dataset.step));};
function show(i,scroll=true){selected=i;const l=lessons[i];document.querySelector('#lesson-content').innerHTML=`<span class="eyebrow">STEP ${String(i+1).padStart(2,'0')} / 06</span><h2>${l.title}</h2>${l.body()}<div class="complete"><label><input id="done" type="checkbox" ${completed.includes(i)?'checked':''}> 이 단계 학습 완료</label>${i<5?'<button class="next">다음 단계 →</button>':'<a href="#roadmap">전체 과정 다시 보기 ↑</a>'}</div>`;update();document.querySelector('#done').onchange=e=>{completed=completed.filter(n=>n!==i);if(e.target.checked)completed.push(i);try{localStorage.setItem('cicd-lab-progress',JSON.stringify(completed))}catch{toast('이 브라우저에서는 진도를 저장할 수 없습니다.')}update()};document.querySelector('.next')?.addEventListener('click',()=>show(i+1));document.querySelectorAll('.copy').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.closest('.code-wrap').querySelector('code').textContent);toast('코드를 복사했습니다.')}catch{toast('복사 권한이 없습니다. 코드를 선택해 복사하세요.')}});if(scroll)document.querySelector('#lesson').scrollIntoView({behavior:'smooth'});}
document.querySelector('#roadmap-grid').innerHTML=lessons.map((l,i)=>`<a href="#lesson" class="roadmap-card" data-road="${i}"><small>STEP ${String(i+1).padStart(2,'0')}</small><b>↗</b><h3>${l.short}</h3><p>${l.desc}</p></a>`).join('');document.querySelectorAll('[data-road]').forEach(a=>a.onclick=()=>show(+a.dataset.road,false));document.querySelector('#faq').innerHTML=faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');document.querySelector('#sources').innerHTML=sources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('');
const gallery=[['assets/jenkins-new-item.png','Jenkins · 작업 생성','New Item에서 Pipeline을 선택하는 실제 화면입니다. 예제 이름 대신 demo-pipeline을 입력하세요.','https://www.jenkins.io/doc/book/pipeline/getting-started/'],['assets/jenkins-console.png','Jenkins · 실행 결과','Console Output에서 실행 로그와 성공 여부를 확인합니다. 공식 Hello World 예제 화면입니다.','https://www.jenkins.io/doc/book/pipeline/getting-started/'],['assets/docker-containers.webp','Docker · 컨테이너 관리','실행 중인 컨테이너와 포트, 상태를 살펴보는 Docker Desktop 공식 예제 화면입니다.','https://github.com/docker/docs/blob/main/content/get-started/docker-concepts/the-basics/images/view-your-containers.webp']];
document.querySelector('#gallery-grid').innerHTML=gallery.map(([img,title,desc,url])=>`<figure><a class="image-link" href="${img}" target="_blank" rel="noopener" aria-label="${title} 이미지 크게 보기"><img loading="lazy" src="${img}" alt="${title} 공식 문서 화면"></a><figcaption><strong>${title}</strong>${desc}<a href="${url}" target="_blank" rel="noopener">출처: 공식 문서 · 원문 보기 ↗</a></figcaption></figure>`).join('');
document.querySelector('#reset').onclick=()=>{if(confirm('저장된 학습 진도를 초기화할까요?')){completed=[];try{localStorage.removeItem('cicd-lab-progress')}catch{}show(selected,false);toast('학습 진도를 초기화했습니다.')}};show(0,false);
