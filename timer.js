function toDouble (num) {
	if (num < 10) {
		return '0' + num;
	}
	else {
		return ''+num;
	}
}

function toMinSec (num) {
	var theTime = num; // 秒
	var theTime1 = 0; // 分
	var result = 0;

	if (theTime >= 60) {
		theTime1 = parseInt(theTime / 60);
		theTime = parseInt(theTime % 60);
	}
	result = '' + toDouble(parseInt(theTime1)) + '.' + toDouble(parseInt(theTime));
	return result;
}

window.onload = function () {
	var isMac = false; //adjust win size between win7 and Mac
	var oBtnSet = document.getElementById('btn1');
	var oBtnCtrl = document.getElementById('btn2');
	var timer = null;
    var timerAlert = null;
	var aImag = document.getElementsByName('numImg');
	var aIcon = document.getElementsByName('icon');
	var oSetblock = document.getElementById('setTimeblock');
	var oSetLang = document.getElementById('setLang');
    var olang = document.getElementsByName('lang');
    var langflg = 0; //0:CN  1:EN
	var oVolume = document.getElementById('Volume');
	var aInput = document.getElementsByName('setTim');
	var aAlertbell = document.getElementsByName('alertbell');
	var aAlertwin = document.getElementsByName('alertwin');
    var sMessage = null;
    var notification;
	var aTime = new Array(4); //0-3:work time | short reset time | long reset time | short times change long
	var timeCount = 0;
	var state = 0; //0:work 1:short reset 2:long reset
	var state_now = 0;
	var state_alert = 0; //no alert window is 0,show alert window is 1,updata alert window is 2;
	var shortTimesCount = 0;
	var oneSec = 1000;
	var numVol = 20;
	var browser = window.navigator.userAgent.toLowerCase();

	/*---storage-----*/
	var local = {
		setItem:function (name,value) {
			window.localStorage.setItem(name,value);
		},
		getItem:function (name) {
			return window.localStorage.getItem(name);
		}
	}

	/*---music play-----*/
	var strAudio = "<audio id='audioPlay' src='music/1.ogg' hidden='true'>";  
	if ( $( "body" ).find( "audio" ).length <= 0 )  
		$( "body" ).append( strAudio );  
	var audio = document.getElementById( "audioPlay" );
		
	function playSound () {
		audio.volume = 1/(101-numVol);//0-1
		audio.play(); 		
	}

	function showTime (time) {
		str = toMinSec(time);
		for (i = 0; i < aImag.length; i++) {
			if (str.charAt(i) == '.') {
				aImag[i].src = 'img/point.png';
			}
			else {
				aImag[i].src = 'img/' + str.charAt(i) + '.png';
			}
		}
		if (state_now != state) {
			state_now = state;
			if (state == 0) {
				aIcon[0].style.display = 'none';
				aIcon[1].style.display = 'block';
			}
			else {
				aIcon[0].style.display = 'block';
				aIcon[1].style.display = 'none';
			}
		}
	}
    
    function updataNotification () {
        if (state_alert) {
            state_alert = 2;
            notification.close();
			i=1;
			timerAlert = setTimeout(myNotification,100); //delay for onclose detect			            
        }
    }
    
    function closeNotification () {
        if (state_alert){
            state_alert = 0;
            clearTimeout(timerAlert);
            notification.close();
        }
    }
    
    function myNotification () {
        
        if (Notification.permission == 'granted') {
            notification = new Notification('', {
                                                body: sMessage,
                                                icon: 'img/icon.png'
                                                });
            oBtnCtrl.value = '开始';
            oBtnCtrl.style.background = "url('img/start.png')";
            state_alert = 1;
            notification.onclick = function() {
                closeNotification();
            };
            notification.onclose = function(){
                if (state_alert != 2 && (oBtnCtrl.value == '开始' && oBtnSet.value != '保存')) {
                    state_alert = 0;
                    clearTimeout(timerAlert);
					oBtnCtrl.value = '暂停';
					oBtnCtrl.style.background = "url('img/pause.png')";
                    timer = setInterval(updateTime, oneSec);
                }
            }
            
            timerAlert = setTimeout(updataNotification,5000); //Notification auto disapear about 20s,I want it show until onclick
        }
        else{
            
            alert (sMessage);
            timer = setInterval(updateTime, oneSec);
        }
    }
    
	function alertShow () {
		if (oSetblock.style.display == 'none') {

			if (aAlertbell[0].checked == true) {
				playSound();
				timer = setInterval(updateTime, oneSec); //after play music auto start time
			}
			else {
				if (state == 0) {
					if (!langflg) {
						sMessage = '点击我，开始工作计时';
					}
					else {
						sMessage = 'Click me, start time for work.';
					}
				}
				else {
					if (!langflg) {
						sMessage = '点击我，开始休息计时';
					}
					else {
						sMessage = 'Click me, start time for rest.';
					}
				}
				state_alert = 1;
				myNotification ();
			}
		}
	}

	function setTime() {
		for(i = 0; i < 3; i++) {
			aTime[i] = 60 * aInput[i].value;
		}
		aTime[3] = aInput[3].value;

		state=0;
		//state_now=state;
		shortTimesCount = aTime[3];
		timeCount = aTime[0];
		numVol = aInput[4].value;
		if (numVol > 100 || numVol < 0) {
			numVol = 20;
		}

		/*----save data----	*/
		var alertF = 0; //0:bell,1:alert;
		if (aAlertwin[0].checked == true) {
			alertF = 1;
		}
		var cvalue =
		  aInput[0].value + 'a' +
		  aInput[1].value + 'a' +
		  aInput[2].value + 'a' +
		  aInput[3].value + 'a' +
		  aInput[4].value + 'a' +  //work short long times vol
		  alertF + 'a' +           // alert mode
          langflg;                 // lang

		local.setItem('userset', cvalue);

		/*----save data----*/
		showTime(timeCount);
	}

	function changeState () {
		switch (state) {
			case 0: //work
				if (shortTimesCount > 0) {
					state = 1;
					timeCount=aTime[1];
					shortTimesCount--;
				}
				else {
					shortTimesCount = aTime[3];
					state = 2;
					timeCount = aTime[2];
				}
				break;
			default:
				state = 0;
				timeCount = aTime[0];
				break;
		}
	}

	function updateTime() {
		if (timeCount > 0) {
			timeCount--;
			showTime(timeCount);
		}
		else {
			clearInterval(timer);
			changeState();
			showTime(timeCount);
			alertShow();			
		}
	}

	function volShow () {
		if (aAlertbell[0].checked == true) {
			oVolume.style.display = 'block';
		} 
		else {
			oVolume.style.display = 'none';
		}

	}

	aAlertbell[0].onclick = function () {
		aAlertbell[0].checked = true;
		aAlertwin[0].checked = false;
		volShow();
		winSize();
	}

	aAlertwin[0].onclick = function () {
		aAlertwin[0].checked = true;
		aAlertbell[0].checked = false;
		volShow();
		winSize();
	}

	oSetblock.onkeyup = function () {
		if (!(event.keyCode >= 48 && event.keyCode <= 57)) {
			event.returnValue = false;
		} 
		else {
			var act = document.activeElement;
			var inNum = act.value;

			switch (act.id) {
				case 'workTime':
					if (act.value > 120) {
						act.value = 120;
					}
					break;
				case 'Times':
					if (act.value > 10) {
						act.value = 10;
					}
					break;
				case 'vol':
					if (act.value > 100) {
						act.value = 100;
					}
					break;
				default:
					if (act.value > 60) {
						act.value = 60;
					}
					break;
			}
			event.returnValue = true;
		}
	}

	oSetLang.onclick = function () {
		langSet();
	}
	
	oBtnSet.onclick = function () {
		if (oBtnSet.value == '设置') {
			oBtnSet.value = '保存';
			oBtnSet.style.background = "url('img/save.png')";
			oSetblock.style.display = 'block';
			volShow();
			oBtnCtrl.value = '开始';
			oBtnCtrl.style.background = "url('img/start.png')";
			clearInterval(timer);
		}
		else{
			oBtnSet.value = '设置';
			oBtnSet.style.background = "url('img/set.png')";
			clearInterval(timer);
			setTime();
			oSetblock.style.display = 'none';
		}
		winSize();
        closeNotification();
	}

	oBtnCtrl.onclick = function () {
		if (oBtnCtrl.value == '开始' && oBtnSet.value == '保存') {
			oBtnCtrl.value = '暂停';
			oBtnCtrl.style.background = "url('img/pause.png')";
			oBtnSet.value = '设置';
			oBtnSet.style.background = "url('img/set.png')";
			clearInterval(timer);
			setTime();
			oSetblock.style.display = 'none';
			updateTime();
			timer = setInterval(updateTime,oneSec);
		} 
		else if (oBtnCtrl.value == '开始') {
			oBtnCtrl.value = '暂停';
			oBtnCtrl.style.background = "url('img/pause.png')";
			updateTime();
			timer = setInterval(updateTime,oneSec);
		} 
		else {
			oBtnCtrl.value = '开始';
			oBtnCtrl.style.background = "url('img/start.png')";
			clearInterval(timer);
		}
		winSize();
        closeNotification();
	}
	
	function winSize(){
		if (isMac) {
			if(oBtnSet.value=='设置'){
				window.resizeTo(200,122);
			}
			else{
				if(aAlertbell[0].checked==true){
					window.resizeTo(200,370);
				}
				else{
					window.resizeTo(200,332);
				}
			}			
		}
		else {
			if(oBtnSet.value=='设置'){
				window.resizeTo(206,129);
			}
			else{
				if(aAlertbell[0].checked==true){
					window.resizeTo(206,377);
				}
				else{
					window.resizeTo(206,339);
				}
			}			
		}
	}

	function init () {
		var cvalue = null;
		var arr = new Array();
		oSetblock.style.display = 'none'; //避免默认状态是style.display == ""

		winSize();
		cvalue=local.getItem('userset');

		if (cvalue) {
			arr = cvalue.split('a');
            
			for (i = 0; i < arr.length; i++) {
				if (i == 5){
					if(arr[i] == 0) {
						aAlertwin[0].checked=false;
						aAlertbell[0].checked=true;
					}
					else {
						aAlertwin[0].checked=true;
						aAlertbell[0].checked=false;
					}
				}
                else if (i == 6) {
                    if(arr[i] == 0) {
                        olang[0].checked = true;
                        olang[1].checked = false;
                    }
                    else {
                        olang[0].checked = false;
                        olang[1].checked = true;
                    }
                }
				else {
					aInput[i].value=arr[i];
				}
			}
		}
		
		langSet();
	}

	function langSet(){
		
		var aOptionlang = document.getElementsByClassName('optionLang');
		var aLangBag = new Array(
								['工作时间: ','Work time: '],
								['分钟','Min'],
								['短休息时间: ','Short break time: '],
								['分钟','Min'],
								['长休息时间: ','Long rest time: '],
								['分钟','Min'],
								['工作: ','After work '],
								['次后长休息一次','times long rest'],
								['提醒方式: ','Alert:'],
								['铃声','Bell'],
								['弹窗','popup'],
								['音量: ','Volume: ']
								);

		if (olang[0].checked) {
			langflg = 0; //CN
		}
		else {
			langflg = 1; //EN
		}
		
		for (i=0;i<aOptionlang.length;i++) {
			aOptionlang[i].innerHTML = aLangBag[i][langflg];
		}
	}

	init();
	setTime();

}