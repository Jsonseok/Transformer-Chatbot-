fetch('https://gctask.com/task/tasks-list.php', {
	method: 'POST', // 또는 'GET', 'PUT', 'DELETE' 등 원하는 HTTP 메서드 사용
	headers: {
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		key1: 'value1',
		key2: 'value2'
	})
})
.then(response => response.json()) // 응답을 JSON으로 파싱
.then(data => console.log(data)) // 파싱된 데이터 출력
.catch(error => console.error('Error:', error)); // 에러 처리