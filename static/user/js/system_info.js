$(document).ready(function() {
	var cpu_obj = $("#cpuChart")[0].getContext('2d');
	var cpu_chart = new Chart(cpu_obj, {
		type: 'bar',
		data: {
			labels: ['CPU 사용률'],
			datasets: [{
				label: 'CPU 사용률',
				data: [0],
				backgroundColor: 'rgba(75, 192, 192, 0.2)'
			}]
		},
		options: {
			indexAxis: 'y',
			scales: {
				x: {
					beginAtZero: true,
					max: 100,
					ticks: {
						stepSize: 10,
						color: 'white'
					}
				},
				y: {
					ticks: {
						display: false
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},
				title: {
					display: false,
					text: 'CPU 사용률',
					color: 'white',
					font: {
						size: 16
					}
				}
			}
		}
	});

	var memory_obj = $("#memoryChart")[0].getContext('2d');
	var memory_chart = new Chart(memory_obj, {
		type: 'bar',
		data: {
			labels: ['메모리 사용률'],
			datasets: [{
				label: '메모리 사용률',
				data: [0],
				backgroundColor: 'rgba(75, 192, 192, 0.2)'
			}]
		},
		options: {
			indexAxis: 'y',
			scales: {
				x: {
					beginAtZero: true,
					max: 100,
					ticks: {
						stepSize: 10,
						color: 'white',  // 눈금자 글자색을 하얀색으로
					}
				},
				y: {
					ticks: {
						display: false  // 왼쪽 축 레이블 숨기기
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},

				title: {
					display: false,
					text: '메모리 사용률',
					color: 'white',  // 레이블 글자색을 하얀색으로
					font: {
						size: 16  // 글자 크기 키우기
					}
				}
			}
		}
	});

	var disk_obj = $("#diskChart")[0].getContext('2d');
	var disk_chart = new Chart(disk_obj, {
		type: 'bar',
		data: {
			labels: ['디스크 사용률'],
			datasets: [{
				label: '디스크 사용률',
				data: [0],
				backgroundColor: 'rgba(75, 192, 192, 0.2)'
			}]
		},
		options: {
			indexAxis: 'y',
			scales: {
				x: {
					beginAtZero: true,
					max: 100,
					ticks: {
						stepSize: 10,
						color: 'white',  // 눈금자 글자색을 하얀색으로
					}
				},
				y: {
					ticks: {
						display: false  // 왼쪽 축 레이블 숨기기
					}
				}
			},
			plugins: {
				legend: {
					display: false
				},

				title: {
					display: false,
					text: '디스크 사용률',
					color: 'white',  // 레이블 글자색을 하얀색으로
					font: {
						size: 16  // 글자 크기 키우기
					}
				}
			}
		}
	});

	var currentTemperature = 0; // 현재 온도를 저장할 전역 변수
	var temp_gage = "";

	// 창 크기 변경 시 게이지 재생성 함수
	function resizeGauge() {
		// 기존 게이지 인스턴스 제거
		if(temp_gage != ""){
			temp_gage.destroy();
		}
		// 새 게이지 생성
		temp_gage = new JustGage({
			id: 'cpuTemp',
			value: currentTemperature,
			min: 0,
			max: 150,
			decimals: 1,
			title: "CPU 온도",
			label: "CPU Temperature ",
			gaugeWidthScale: 0.6,
			relativeGaugeSize: true,
			symbol: '°C',
			pointer: true,
			pointerOptions: {
				toplength: -15,
				bottomlength: 10,
				bottomwidth: 8,
				color: '#8e8e93',
				stroke: '#ffffff',
				stroke_width: 2,
				stroke_linecap: 'round'
			},
			titleMinFontSize: 20, // 제목 폰트 크기 설정
			valueMinFontSize: 20, // 값 폰트 크기 설정
			labelMinFontSize: 12, // 라벨 폰트 크기 설정
			minLabelMinFontSize: 14, // 최소값 라벨 폰트 크기 설정
			maxLabelMinFontSize: 14, // 최대값 라벨 폰트 크기 설정
			titleFontColor: "#fff", // 제목 폰트 색상 설정
			valueFontColor: "red", // 값 폰트 색상 설정
			labelFontColor: "#fff", // 라벨 폰트 색상 설정
			minLabelFontColor: "#fff", // 최소값 라벨 폰트 색상 설정
			maxLabelFontColor: "#fff" // 최대값 라벨 폰트 색상 설정
		});
	}

	// 창 크기 변경 시 게이지 재생성 이벤트 리스너 등록
	window.addEventListener('resize', resizeGauge);
	resizeGauge();

	function getValueToColor(value){
		var color;
		
		if (value <= 50) {
			color = '#00FF00';
		} else if (color <= 80) {
			color = '#FFFF00';
		} else {
			color = '#FF0000';
		}	
		return color;
	}

	// 온도를 업데이트하는 함수
	function updateTemperature(newTemp) {
		currentTemperature = newTemp; // 전역 변수에 현재 온도 저장
		temp_gage.refresh(newTemp); // 게이지 값 업데이트
		//console.log("온도,", currentTemperature)
		// 온도에 따라 색상 변경
		var color;
		color = getValueToColor(currentTemperature)
		temp_gage.update({ valueFontColor: color });

	}

	var avgCpuSum = 0;
	var avgCpuCnt = 0;
	var cpuCheckCnt = 0;
	function cpuUsed(num) {
		cpuCheckCnt++;

		if (cpuCheckCnt < 2) {
			//console.log("평균");
			return false;
		}

		var cpuUsage = parseFloat(num).toFixed(1);
		var color;

		avgCpuCnt++;
		avgCpuSum += Number(cpuUsage);
		var avgCpu = avgCpuSum / avgCpuCnt;
		//console.log("평균cpu사용률,",avgCpuCnt+","+cpuUsage+","+parseFloat(avgCpu).toFixed(1));

		color = getValueToColor(cpuUsage)
		
		$(".chart-cpu-value").html(cpuUsage + "%").css('color', color);
		cpu_chart.data.datasets[0].backgroundColor = color;
		cpu_chart.data.datasets[0].data[0] = cpuUsage;

		cpu_chart.update();
	}

	function memoryUsed(num, data) {
		var memoryUsage = num;
		var color;

		color = getValueToColor(memoryUsage)
		
		var total_memory_bytes = data.total_memory;
		var used_memory_bytes = data.used_memory;

		var total_memory_gb = total_memory_bytes / Math.pow(1024, 3);
		var used_memory_gb = used_memory_bytes / Math.pow(1024, 3);

		//console.log("Total Memory: " + total_memory_gb.toFixed(2) + " GB");
		//console.log("Used Memory: " + used_memory_gb.toFixed(2) + " GB");		

		$(".chart-memory-value").html(used_memory_gb.toFixed(2) + " GB" + " / " + total_memory_gb.toFixed(2) + " GB").css('color', color);

		memory_chart.data.datasets[0].backgroundColor = color;
		memory_chart.data.datasets[0].data[0] = memoryUsage;

		memory_chart.update();
	}

	function diskUsed(num, data) {
		var diskUsage = num;
		var color;

		color = getValueToColor(diskUsage)
		
		var total_disk_bytes = data.total_disk;
		var used_disk_bytes = data.used_disk;

		var total_disk_gb = total_disk_bytes / Math.pow(1024, 3);
		var used_disk_gb = used_disk_bytes / Math.pow(1024, 3);

		$(".chart-disk-value").html(used_disk_gb.toFixed(2) + " GB" + " / " + total_disk_gb.toFixed(2) + " GB").css('color', color);

		disk_chart.data.datasets[0].backgroundColor = color;
		disk_chart.data.datasets[0].data[0] = diskUsage;
		disk_chart.update();
	}

	setInterval(function() {
		// 최초 데이터 요청
		socket.emit('get_system_info', {});
	}, 1000);

	socket.on('ret_system_info', function(data) {
		//console.log("시스템 상태",data)
		cpuUsed(data.cpu_percent);
		memoryUsed(data.memory_percent, data);
		diskUsed(data.disk_percent, data);
		updateTemperature(data.cpu_temp);
	});
});

