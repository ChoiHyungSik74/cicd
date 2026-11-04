document.querySelector('#docker-basics').innerHTML = `
<div class="section-head"><div><span class="eyebrow">DOCKER, IN PLAIN WORDS</span><h2>Docker가 뭔가요?<br>앱의 ‘실행 준비물’을 함께 담는 도구예요.</h2></div><a class="text-link" href="#server-deploy">Docker 없이 배포하려면? ↓</a></div>
<div class="easy-intro"><p>친구에게 커피를 만들어 달라고 부탁한다고 생각해 보세요. 레시피만 보내면 친구의 원두나 기계가 달라 맛이 달라질 수 있죠. <strong>원두, 도구, 레시피를 같은 세트로 준비하면</strong> 비슷한 조건에서 만들기 쉬워집니다.</p><p>프로그램도 같습니다. 내 PC에서는 잘 되는데 서버에서는 Java 버전이나 설치된 라이브러리가 달라 실행되지 않을 수 있어요. Docker는 <strong>앱과 앱에 필요한 실행 환경을 이미지로 묶고, 컨테이너라는 분리된 공간에서 실행</strong>하도록 도와줍니다.</p></div>
<div class="concept-flow" aria-label="Dockerfile에서 이미지를 만들고 컨테이너를 실행하는 흐름"><div><small>만드는 방법</small><h3>Dockerfile</h3><p>“Java를 준비하고<br>이 앱을 실행해 주세요.”</p></div><b>build →</b><div><small>준비된 실행 패키지</small><h3>이미지</h3><p>앱 + Java + 필요한 파일<br>아직 실행 중인 앱은 아니에요.</p></div><b>run →</b><div><small>실제로 실행 중</small><h3>컨테이너</h3><p>이미지로 시작한 앱<br>하나의 이미지로 여러 개 실행 가능!</p></div></div>
<details open><summary>꼭 알아둘 말 5개만 살펴봐요</summary><table><tr><th>용어</th><th>쉬운 설명</th><th>이 실습의 예</th></tr><tr><td>이미지</td><td>실행에 필요한 파일을 담은 준비된 패키지</td><td>cicd-demo:3</td></tr><tr><td>컨테이너</td><td>이미지에서 시작한 분리된 실행 공간</td><td>실행 중인 cicd-demo</td></tr><tr><td>포트</td><td>프로그램으로 들어가는 문 번호</td><td>PC의 8081 → 앱의 8080</td></tr><tr><td>볼륨</td><td>컨테이너를 바꿔도 남겨둘 데이터 보관 공간</td><td>Gitea 코드와 Jenkins 설정</td></tr><tr><td>Compose</td><td>여러 컨테이너의 실행 방법을 함께 적는 설정</td><td>Gitea와 Jenkins를 한 번에 시작</td></tr></table></details>
<details><summary>docker run 한 줄을 읽어 볼까요?</summary>${block('설명용 예제 · 앞의 실습에서 이미지를 만든 뒤 실행',`docker run -d --name cicd-demo -p 8081:8080 cicd-demo:3`)}<ul><li><code>docker run</code>: 이미지로 새 컨테이너를 만들고 실행합니다.</li><li><code>-d</code>: 터미널 뒤에서 계속 실행합니다.</li><li><code>--name cicd-demo</code>: 컨테이너에 이름표를 붙입니다. 같은 이름이 이미 있으면 새로 만들 수 없습니다.</li><li><code>-p 8081:8080</code>: PC의 8081번 문으로 오면 컨테이너의 8080번 문으로 연결합니다.</li><li><code>cicd-demo:3</code>: 사용할 이미지 이름과 태그입니다. 3은 이 예제의 빌드 번호입니다.</li></ul><p>브라우저에서는 <code>http://localhost:8081/hello</code>로 접속합니다. 이 명령은 안내용이며 이 홈페이지에서 실행되지는 않습니다.</p></details>
<details><summary>Docker를 쓰면 서버도 Java도 필요 없나요?</summary><p>서버는 여전히 필요합니다. Docker가 실행될 PC 또는 서버가 있어야 해요. 이 예제에서는 Java를 이미지에 담기 때문에 앱 서버에 Java를 별도로 설치할 필요가 없지만, Docker를 실행할 환경은 필요합니다.</p><p>컨테이너는 완전한 PC 한 대를 복제한 가상 머신과 다릅니다. 보통 호스트의 커널을 공유하며, Docker Desktop은 Linux 컨테이너를 위해 Linux 실행 환경을 제공합니다. 운영체제·CPU 호환성, 외부 설정과 데이터까지 자동으로 해결해 주지는 않습니다.</p></details>
<details><summary>컨테이너를 지우면 데이터도 없어지나요?</summary><p>컨테이너 내부에만 저장한 변경은 컨테이너 삭제 시 사라질 수 있습니다. 계속 보관할 파일은 볼륨이나 외부 저장소에 둡니다. 이 가이드의 Compose에 있는 <code>gitea_data</code>, <code>jenkins_data</code>가 그 역할을 합니다. 볼륨 자체를 삭제하면 보관한 데이터도 지워질 수 있으므로 백업은 별도로 필요합니다.</p></details>
<p class="source-line">공식 자료: <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/" target="_blank" rel="noopener">컨테이너란?</a> · <a href="https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/" target="_blank" rel="noopener">이미지란?</a></p>`;

document.querySelector('#server-deploy').innerHTML = `
<div class="section-head"><div><span class="eyebrow">ANOTHER WAY TO DEPLOY</span><h2>Docker 없이도 배포할 수 있어요.</h2></div><a class="text-link" href="#docker-basics">Docker 기초 다시 보기 ↑</a></div>
<p>Spring Boot 앱은 <strong>실행 가능한 JAR 파일</strong>로 만들 수 있습니다. JAR는 Java 프로그램과 필요한 라이브러리를 담은 묶음입니다. 서버에 Java를 설치하고 이 파일을 실행하면 됩니다. Spring Web의 기본 구성에는 웹 서버가 포함되어 있어 별도 Tomcat 설치가 필요하지 않습니다.</p>
<div class="concept-flow server-flow" aria-label="일반 서버 배포 흐름"><div><small>내 PC 또는 Jenkins</small><h3>테스트 → JAR</h3><p>Maven으로 실행 파일 만들기</p></div><b>scp →</b><div><small>Ubuntu 서버</small><h3>Java로 실행</h3><p>java -jar app.jar</p></div><b>관리 →</b><div><small>계속 실행되도록</small><h3>systemd</h3><p>시작·중지·재시작·로그 관리</p></div></div>
<table><tr><th>비교</th><th>Docker 배포</th><th>일반 서버 배포</th></tr><tr><td>서버에 준비할 것</td><td>Docker 실행 환경</td><td>앱과 호환되는 Java</td></tr><tr><td>전달하는 결과물</td><td>컨테이너 이미지</td><td>실행 가능한 JAR</td></tr><tr><td>실행 관리</td><td>컨테이너 실행·재시작</td><td>systemd 서비스 실행·재시작</td></tr><tr><td>공통으로 필요한 것</td><td colspan="2">설정·권한·로그·통신 확인·백업·실패 시 복구</td></tr></table>
${note('아래는 Ubuntu 24.04 LTS + Java 21 + systemd를 사용하는 별도 서버의 학습 예제입니다. 기존 Docker 과정 대신 선택하는 배포 경로입니다. 실제 명령은 사용자가 자신의 서버에서 실행하며, 홈페이지 수정 작업은 서버에 아무것도 설치하거나 배포하지 않습니다.')}
<details open><summary>1. 준비: 어느 컴퓨터에서 무엇을 하나요?</summary><ul><li><strong>내 Windows PC:</strong> 기존 demo 프로젝트, JDK 21, PowerShell의 ssh·scp 명령이 필요합니다.</li><li><strong>Ubuntu 서버:</strong> 로그인 가능한 <code>deploy</code> 계정과 초기 설정을 위한 sudo 권한, SSH 연결이 필요합니다. 계정이 없다면 서버 관리자에게 생성을 요청하세요.</li><li>예제의 <code>SERVER_IP</code>는 실제 서버 IP 또는 도메인으로 바꿉니다. 예제 주소를 그대로 사용하면 연결되지 않습니다.</li><li>기존 Spring Boot 앱의 <code>/hello</code>를 사용합니다. 이미 다른 앱이 사용하는 서버에서는 폴더·서비스명·포트를 구분합니다.</li></ul><p>SSH는 원격 서버에 접속하는 통로이고, SCP는 SSH를 통해 파일을 보내는 도구입니다. 첫 접속의 호스트 키 지문은 서버 관리자에게 확인한 값과 비교한 뒤 신뢰하세요.</p>${block('내 PC · PowerShell',`ssh deploy@SERVER_IP`)}<p>접속 후 명령 프롬프트가 서버 계정으로 바뀌면 그 뒤에 입력하는 명령은 서버에서 실행됩니다. <code>exit</code>로 내 PC로 돌아옵니다.</p></details>
<details><summary>2. 서버에 Java와 앱 전용 계정 준비하기</summary>${block('Ubuntu 서버 · deploy 계정 · 최초 1회',`sudo apt update
sudo apt install -y openjdk-21-jre-headless curl
java -version
command -v java
sudo useradd --system --user-group --home-dir /opt/cicd-demo --shell /usr/sbin/nologin cicdapp
sudo install -d -o deploy -g deploy -m 0755 /opt/cicd-demo /opt/cicd-demo/releases`)}<p>Java 버전이 21인지 확인합니다. <code>cicdapp</code>은 앱을 실행할 전용 계정이며 직접 로그인하지 않습니다. <code>deploy</code>는 JAR를 올리는 계정입니다. 계정이 이미 있다면 useradd를 다시 실행할 필요가 없습니다. Java 경로가 /usr/bin/java가 아니라면 아래 서비스 파일의 경로도 맞춥니다.</p></details>
<details><summary>3. 내 PC에서 테스트하고 JAR 보내기</summary>${block('내 PC · PowerShell · demo 폴더',`.\\mvnw.cmd clean verify
Get-ChildItem .\\target\\*.jar
scp .\\target\\demo-0.0.1-SNAPSHOT.jar deploy@SERVER_IP:/opt/cicd-demo/releases/app-v1.jar`)}<p><code>BUILD SUCCESS</code>를 확인한 뒤 전송합니다. 실제 JAR 이름이 다르면 목록에 나온 <strong>실행 가능한 JAR 파일명</strong>으로 바꾸세요. .original 파일이나 plain JAR를 선택하지 않습니다. 서버 경로의 app-v1.jar는 첫 배포 버전을 구분하기 위한 이름입니다.</p>${block('Ubuntu 서버 · 먼저 직접 실행해 보기',`java -jar /opt/cicd-demo/releases/app-v1.jar --server.address=127.0.0.1 --server.port=8081`)}<p>다른 SSH 창에서 <code>curl --fail http://127.0.0.1:8081/hello</code>를 실행해 응답을 확인합니다. 앱을 실행한 창에서 Ctrl+C로 종료한 뒤 다음 단계로 넘어갑니다. 터미널에서 직접 실행하는 방식은 확인용이며, 계속 실행할 때는 서비스를 등록합니다.</p></details>
<details><summary>4. systemd로 계속 실행하고 재부팅에도 자동 시작하기</summary><p>systemd는 Linux에서 프로그램을 서비스로 관리하는 도구입니다. 다음 명령으로 현재 버전을 지정하고 편집기를 엽니다.</p>${block('Ubuntu 서버',`chmod 0644 /opt/cicd-demo/releases/app-v1.jar
ln -sfn /opt/cicd-demo/releases/app-v1.jar /opt/cicd-demo/current.jar
sudo nano /etc/systemd/system/cicd-demo.service`)}<p>아래 내용을 붙여 넣습니다. nano에서는 Ctrl+O → Enter로 저장하고 Ctrl+X로 닫습니다.</p>${block('/etc/systemd/system/cicd-demo.service',`[Unit]
Description=CI/CD Spring Boot demo
After=network.target

[Service]
Type=simple
User=cicdapp
Group=cicdapp
WorkingDirectory=/opt/cicd-demo
ExecStart=/usr/bin/java -jar /opt/cicd-demo/current.jar --server.address=127.0.0.1 --server.port=8081
SuccessExitStatus=143
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target`)}${block('Ubuntu 서버',`sudo systemctl daemon-reload
sudo systemctl enable --now cicd-demo
sudo systemctl status cicd-demo --no-pager
curl --fail --retry 12 --retry-delay 5 --retry-connrefused --max-time 10 http://127.0.0.1:8081/hello
sudo journalctl -u cicd-demo -n 60 --no-pager`)}<p><code>active (running)</code>과 /hello 응답을 함께 확인합니다. active 표시만으로 앱의 정상 응답까지 보장하지는 않습니다. <code>enable</code>은 부팅 시 시작하도록 설정하고 <code>--now</code>는 지금도 시작합니다. 앱은 일반 사용자 권한으로 실행되며 로그는 journalctl로 확인합니다.</p></details>
<details><summary>5. 내 PC 브라우저에서 서버 앱 확인하기</summary><p>예제 앱은 서버 내부 주소에만 연결됩니다. 학습 중에는 앱 포트를 외부에 열지 않고 SSH 터널로 확인할 수 있습니다. 서버의 8081번 문을 내 PC의 9092번 문에 연결한다고 생각하세요.</p>${block('내 PC · 새 PowerShell 창 · 창을 열어 둡니다',`ssh -N -L 9092:127.0.0.1:8081 deploy@SERVER_IP`)}<p>이제 내 PC 브라우저에서 <code>http://localhost:9092/hello</code>를 엽니다. 여기서 localhost는 내 PC지만, 터널이 요청을 서버에 전달합니다. Ctrl+C로 터널을 종료합니다.</p><p>실제 사용자에게 공개하려면 도메인과 HTTPS, Nginx 같은 리버스 프록시, 서버·클라우드 방화벽을 별도로 설정합니다. 이 예제의 SSH 터널은 개인 확인용입니다.</p></details>
<details><summary>6. 새 버전으로 교체하고 문제가 생기면 되돌리기</summary><p>코드를 수정한 뒤 테스트와 패키징을 다시 수행하고 새 이름으로 올립니다. 기존 파일은 복구를 위해 남겨 둡니다.</p>${block('내 PC · PowerShell · demo 폴더',`.\\mvnw.cmd clean verify
scp .\\target\\demo-0.0.1-SNAPSHOT.jar deploy@SERVER_IP:/opt/cicd-demo/releases/app-v2.jar`)}${block('Ubuntu 서버 · 새 버전으로 변경',`chmod 0644 /opt/cicd-demo/releases/app-v2.jar
ln -sfn /opt/cicd-demo/releases/app-v2.jar /opt/cicd-demo/current.jar
sudo systemctl restart cicd-demo
curl --fail --retry 12 --retry-delay 5 --retry-connrefused --max-time 10 http://127.0.0.1:8081/hello`)}<p>응답과 로그를 확인합니다. 문제가 있으면 이전 성공 파일로 링크를 되돌린 뒤 재시작합니다.</p>${block('Ubuntu 서버 · v1이 이전 성공 버전인 경우',`ln -sfn /opt/cicd-demo/releases/app-v1.jar /opt/cicd-demo/current.jar
sudo systemctl restart cicd-demo
curl --fail --retry 12 --retry-delay 5 --retry-connrefused --max-time 10 http://127.0.0.1:8081/hello`)}${note('이 방식은 재시작 중 잠깐 중단됩니다. 자동 롤백이나 무중단 배포 예제가 아닙니다. DB 스키마나 데이터가 변경되었다면 JAR만 되돌리는 것으로 복구되지 않을 수 있습니다.')}</details>
<details><summary>7. Jenkins에서는 어떤 부분이 달라지나요?</summary><p>Gitea와 Jenkins의 역할은 같습니다. <strong>Docker 이미지 빌드·컨테이너 교체 대신 Maven 빌드·JAR 전송·서비스 재시작</strong>을 실행합니다. 먼저 위 수동 배포를 성공시킨 뒤 자동화하세요.</p><ol><li>별도의 Linux Jenkins agent에 Java 21, Git, openssh-client와 Maven Wrapper 실행 환경을 준비하고 <code>java21-ssh</code> 라벨을 붙입니다. 기존 Docker 실습용 Jenkins 컨테이너만으로 아래 예제의 준비가 완료되는 것은 아닙니다.</li><li>Jenkins에 SSH Agent 플러그인을 설치하고 Credentials에 <strong>SSH Username with private key</strong>를 등록합니다. Username은 deploy, ID는 <code>ubuntu-deploy-key</code>입니다. 공개 키는 서버 deploy 계정의 authorized_keys에 등록되어 있어야 합니다.</li><li>빌드 에이전트의 Jenkins 실행 계정에 서버 호스트 키를 미리 등록하고 지문을 관리자와 대조합니다. 호스트 확인을 끄는 옵션을 사용하지 않습니다.</li><li>서버 관리자가 deploy 계정에 <strong>해당 서비스 재시작만</strong> 비밀번호 없이 허용해야 합니다. <code>command -v systemctl</code>로 경로를 확인한 뒤 <code>sudo visudo -f /etc/sudoers.d/cicd-demo</code>에서 아래 한 줄을 등록합니다. sudo 전체 권한을 비밀번호 없이 허용하지 않습니다.</li></ol>${block('sudoers · /usr/bin/systemctl 경로인 경우',`deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart cicd-demo`)}<p>아래는 <strong>기존 Docker용 Jenkinsfile을 대체하는 예제</strong>입니다. Pipeline from SCM의 저장소·main 브랜치 설정은 유지합니다. SERVER_IP를 바꾸고, 선택한 에이전트가 Gitea 저장소 주소에 접근할 수 있는지 확인하세요. Docker 네트워크 밖의 에이전트에서는 gitea라는 서비스명이 해석되지 않으므로 실제 접근 가능한 Gitea 주소가 필요합니다.</p>${block('일반 서버용 Jenkinsfile · 별도 Linux agent 전제',`pipeline {
  agent { label 'java21-ssh' }
  options { disableConcurrentBuilds() }
  triggers { pollSCM('H/2 * * * *') }
  environment { DEPLOY_HOST = 'SERVER_IP' }
  stages {
    stage('Test and package') {
      steps {
        sh 'chmod +x mvnw && ./mvnw -B clean verify'
        sh 'cp target/demo-0.0.1-SNAPSHOT.jar app.jar'
      }
    }
    stage('Deploy JAR') {
      steps {
        sshagent(credentials: ['ubuntu-deploy-key']) {
          sh '''
            set -eu
            release="app-$(date -u +%Y%m%dT%H%M%S)-$BUILD_NUMBER.jar"
            scp -o BatchMode=yes -o StrictHostKeyChecking=yes app.jar "deploy@$DEPLOY_HOST:/opt/cicd-demo/releases/$release"
            ssh -o BatchMode=yes -o StrictHostKeyChecking=yes "deploy@$DEPLOY_HOST" "chmod 0644 /opt/cicd-demo/releases/$release && ln -sfn /opt/cicd-demo/releases/$release /opt/cicd-demo/current.jar && sudo -n /usr/bin/systemctl restart cicd-demo && curl --fail --retry 12 --retry-delay 5 --retry-connrefused --max-time 10 http://127.0.0.1:8081/hello"
          '''
        }
      }
    }
  }
}`)}<p>JAR 이름은 프로젝트에 맞춰 바꿉니다. 빌드 번호와 시간으로 릴리스를 구분합니다. 테스트 실패 시 전송하지 않으며, 배포 후 HTTP 확인이 실패하면 Jenkins 작업이 실패합니다. 이 경우 자동 복구하지 않으므로 앞 단계의 수동 복구 절차를 사용합니다. 같은 서비스를 배포하는 작업은 하나로 유지하세요.</p></details>
<details><summary>오류가 나면 어디를 확인하나요?</summary><ul><li><strong>UnsupportedClassVersionError:</strong> 빌드한 Java 버전과 서버 Java 버전을 확인합니다. 이 예제는 모두 Java 21입니다.</li><li><strong>Permission denied (publickey):</strong> SSH 계정, 키, 서버 authorized_keys와 파일 권한을 확인합니다.</li><li><strong>Unable to access jarfile:</strong> current.jar의 연결 대상과 cicdapp 계정의 읽기 권한을 확인합니다.</li><li><strong>Address already in use:</strong> 서버의 8081 포트를 다른 프로그램이 사용 중인지 확인합니다.</li><li><strong>Jenkins에서 sudo 비밀번호 요청:</strong> 등록한 서비스명·명령 경로가 sudoers의 허용 명령과 정확히 일치하는지 확인합니다.</li><li><strong>서버 curl은 되는데 브라우저는 안 됨:</strong> SSH 터널 창이 열려 있는지, 브라우저 주소가 localhost:9092인지 확인합니다.</li></ul></details>
<p class="source-line">공식 자료: <a href="https://docs.spring.io/spring-boot/how-to/deployment/installing.html" target="_blank" rel="noopener">Spring Boot JAR 실행과 systemd 서비스 등록</a> · <a href="https://www.jenkins.io/doc/pipeline/steps/ssh-agent/" target="_blank" rel="noopener">Jenkins SSH Agent</a></p>`;

document.querySelectorAll('.extra-guide .copy').forEach(button => button.addEventListener('click', async () => {
  const code = button.closest('.code-wrap').querySelector('code').textContent;
  try { await navigator.clipboard.writeText(code); toast('코드를 복사했습니다.'); }
  catch { toast('복사 권한이 없습니다. 코드를 선택해 복사하세요.'); }
}));
const shortcuts = document.createElement('div');
shortcuts.className = 'guide-shortcuts';
shortcuts.innerHTML = '<a href="#docker-basics">Docker가 처음이라면 →</a><a href="#server-deploy">Docker 없이 서버에 배포하기 →</a>';
document.querySelector('.hero-copy').append(shortcuts);
