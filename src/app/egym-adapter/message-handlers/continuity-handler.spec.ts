import {expect} from 'chai';
import {createContinuityHandler} from './continuity-handler';
import * as sinon from 'sinon';
import {GameController, GameControllerCommands} from '../../game-controller/GameController';

describe('ContinuityHandler', () => {
  let controllerMock: GameController;
  let handler;
  beforeEach(() => {
	controllerMock = {
	  execute: sinon.spy()
	};
	handler = createContinuityHandler(controllerMock, {
	  thresholds: {min: 0.1, max: 0.9},
	  commands: {startMove: GameControllerCommands.A_BUTTON, endMove: GameControllerCommands.A_BUTTON_RELEASE},
	  timeToStop: 100
	});
  });
  it('starts as soon as the player goes up and down', () => {
	handler(0);
	handler(1);
	expect(controllerMock.execute).to.have.been.calledWith(GameControllerCommands.A_BUTTON);
  });
  it('stops after a second as soon as the player stops moving', (done) => {
	handler(0);
	handler(1);
	setTimeout(() => {
	  expect(controllerMock.execute).to.have.been.calledWith(GameControllerCommands.A_BUTTON_RELEASE);
	  done();
	}, 110);
  });


  const sendUp = () => handler(0);
  const sendDown = () => handler(1);
  it('does not call stop while player is constantly moving up and down', (done) => {
	let state = 'up';
	const interval = setInterval(() => {
	  if (state === 'up') {
		state = 'down';
		sendDown();
	  } else {
		state = 'up';
		sendUp();
	  }
	}, 50);

	setTimeout(() => {
	  clearInterval(interval);
	  expect(controllerMock.execute).not.to.have.been.calledWith(GameControllerCommands.A_BUTTON_RELEASE);
	  done();
	}, 200);
  });
});