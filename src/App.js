import './App.css';
import { useEffect, useState, useRef } from 'react';
import logo from './img/logo.png';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Button } from 'react-bootstrap';
import ShortBeep from './sounds/short-beep.m4a';
import LongBeep from './sounds/long-beep.m4a';

function App() {

  const INTERVAL_TIME = 500;
  const shortBeep = new Audio(ShortBeep);
  const longBeep = new Audio(LongBeep);

  let actInterval = useRef(0);

  const [ current, setCurrent ] = useState('study');
  const [ timeStudyInput, setTimeStudyInput ] = useState('00:00');
  const [ timeBreakInput, setTimeBreakInput ] = useState('00:00');

  const [ currentTime, setCurrentTime ] = useState(0);
  const [ endingTime, setEndingTime ] = useState(0);

  const [ timeStudy, setTimeStudy ] = useState(0);
  const [ timeBreak, setTimeBreak ] = useState(0);
  const [ pomodoroCount, setPomodoroCount ] = useState(1);
  const [ actCount, setActCount ] = useState(0);
  
  const [ active, setActive ] = useState(false);
  
  const getMilliseconds = (timeStr) => {
    const [ hours, minutes ] = timeStr.split(':');
    
    const seconds = (hours * 3600) + (minutes * 60);
    return seconds * 1000;
  }

  const getTimeString = (milliseconds) => {
    let minutes = (milliseconds / 60000) >= 0 ? (milliseconds / 60000) : 0;
    let hours = (minutes/60) >= 0 ? Math.floor(minutes / 60) : 0;
    minutes = (minutes % 60) >= 0 ? Math.floor(minutes % 60) : 0;

    let seconds = Math.floor((milliseconds - ((hours * 3600000) + (minutes * 60000))) / 1000);
    seconds = seconds >= 0 ? seconds : 0; 

    return `${ hours < 10 ? `0${hours}` : hours }:${ minutes < 10 ? `0${minutes}` : minutes }:${ seconds < 10 ? `0${seconds}` : seconds }`;
  }

  const activateContainer = (e) => {

      if (active) return;

      const activeContainer = e.target.closest('.timer-container');

      document.querySelectorAll('.timer-container').forEach((el) => {
        if (el === activeContainer){
          el.classList.add('timer-container-active')
          el.querySelector('.timer-input').focus();
        }
        else
          el.classList.remove('timer-container-active');
      })
  }

  const blurContainers = (e) => {
    document.querySelectorAll('.timer-container').forEach((el) => {
      el.classList.remove('timer-container-active');
      el.querySelector('.timer-input').step = "";
    })
  }

  const setCurrentContainer = (timer) => {
    const container = timer.closest('.timer-container');
    document.querySelectorAll('.timer-container').forEach((el) => {
      if (el === container) {
        container.classList.add('timer-container-active');
        timer.step = '1';
      }
      else {
        el.querySelector('.timer-input').step = '0';
        el.classList.remove('timer-container-active');
      }
    });
  } 

  const startPomodoro = () => {
    if (timeStudy === 0 || timeBreak === 0 | pomodoroCount === 0) return;

    setEndingTime(new Date().getTime() + timeStudy);
    setCurrentTime(new Date().getTime());
    setCurrent('study');
    setActive(true);
    setTimeout(() => {setCurrentContainer(document.getElementById('timer-study')); longBeep.play(); }, 10);
  }

  const stopPomodoro = () => {
    setActive(false);
    setTimeStudy(0);
    setTimeBreak(0);

    setTimeStudyInput('00:00');
    setTimeBreakInput('00:00');
    setPomodoroCount(1);
    setActCount(0);

    blurContainers();
  }

  const switchInterval = () => {

    if (current === 'study') {
      setEndingTime(new Date().getTime() + timeBreak);
      setActCount(actCount + 1);
      setCurrentContainer(document.getElementById('timer-break'));
      setTimeStudyInput(getTimeString(timeStudy));
    } else {
      setEndingTime(new Date().getTime() + timeStudy);
      setCurrent('study');
      setCurrentContainer(document.getElementById('timer-study'));
      setTimeBreakInput(getTimeString(timeBreak));
      shortBeep.play();
      actInterval.current = setInterval(() => { pomodoroInterval(); }, INTERVAL_TIME);
    }
  }

  const pomodoroInterval = () => {
    setCurrentTime(new Date().getTime());
  }

  useEffect(() => {
    if (!active) return;

    if (currentTime >= endingTime) {
      window.clearInterval(actInterval.current);
      switchInterval();
      return;
    }
    
    if (current === 'study') setTimeStudyInput(getTimeString(endingTime - currentTime));
    else setTimeBreakInput(getTimeString(endingTime - currentTime));
  },[currentTime]);

  useEffect(() => {
    if (active){
      actInterval.current = (setInterval(() => { pomodoroInterval(); }, INTERVAL_TIME));
    } else {
      window.clearInterval(actInterval.current);
    }
  }, [active]);

  useEffect(() => {

    if (!active) return;

    window.clearInterval(actInterval.current);

    actInterval.current = (setInterval(() => { pomodoroInterval(); }, INTERVAL_TIME));

  }, [current]);

  useEffect(() => {
    if (!active) return;

    if (actCount === pomodoroCount) {
      stopPomodoro();
      longBeep.play();
      return;
    }

    shortBeep.play();
    setCurrent('break');
  },[actCount]);

  useEffect(() => {
    document.title = 'Timer Pomodoro';
  },[]);

  return (
    <div className="App">

      <Container>
        <Row>
          <Col className="col-info">
            <div className="info-text">
              <h1 className="info-title">Timer Pomodoro</h1>

              <img src={logo} alt='logo'></img>
              <p className="info-description">La técnica Pomodoro es una técnica para administrar el tiempo al momento de trabajar o estudiar.
                Consiste en separar el horario de trabajo en intervalos de tiempo, separados por momentos de descanso. Cada intervalo es un "Pomodoro".
              </p>

              <p className="info-description" id="desc-2">En la técnica original se trabajan 25 minutos y se descansa entre 5-10 minutos, realizando 4 pomodoros en total,
                pero se puede adaptar al tiempo de cada uno.
              </p>

              <p className="timer-subtitle">(No se puede asegurar que el timer sea exacto al 100%, pero funciona como un best-effort 👍)</p>
            </div>
          </Col>

          <Col className="col-timers" onFocus={ activateContainer } onClick={ activateContainer }>
            <div className="timer-container">
              <h1>Tiempo de estudio</h1>
              <input type="time"
                    className="timer-input"
                    id="timer-study"
                    value={timeStudyInput}
                    onChange={ e => { setTimeStudyInput(e.target.value); setTimeStudy(getMilliseconds(e.target.value)); } }>
              </input>
            </div>

            <div className="timer-container">
              <h1>Tiempo de descanso</h1>
              <input type="time"
                    className="timer-input"
                    id="timer-break"
                    value={timeBreakInput}
                    onChange={ e => { setTimeBreakInput(e.target.value); setTimeBreak(getMilliseconds(e.target.value)); } }>
              </input>
            </div>

            { (!active) ?
              <>
                <h3 style={{ marginTop: '2%' }}>Cantidad de pomodoros</h3>
                <input type="number" className="count-input" value={pomodoroCount} onChange={ e => setPomodoroCount(+e.target.value) } min="1"></input>

                <Button variant="danger" onClick={ startPomodoro }>Empezar</Button>
              </>
            : <>
              <h3>Pomodoro en curso...</h3>
              <p className="timer-subtitle">Hasta ahora cumpliste <span className="count">{actCount}/{pomodoroCount}</span> pomodoros.</p>
              <Button variant="secondary" onClick={ stopPomodoro }>Terminar</Button>

              <p className="timer-subtitle count">To-do: implementar una opción para pausar (próximamente 👍)</p>
            </>
            }
            <p className="timer-subtitle">(Va a hacer ruidos cada vez que cambie de reloj. No te asustes)</p>
          </Col>
        </Row>

      </Container>
    </div>
  );
}

export default App;
