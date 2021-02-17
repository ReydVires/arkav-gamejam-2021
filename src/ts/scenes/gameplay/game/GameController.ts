import { GameState } from "../../../info/GameInfo";

export const enum EventNames {
	onScoreChange = "onScoreChange",
}

type OnScoreChange = (score: number) => void;

export class GameController {

	private _event: Phaser.Events.EventEmitter;

	private _state: GameState;
	private _score: number;
	private _baseScore: number;
	private _timer: number;
	private _baseTimerScore: number;

	constructor () {
		this._event = new Phaser.Events.EventEmitter();

		// Should be references from gamedata
		this._baseScore = 5;
		this._baseTimerScore = 500;
	}

	get state (): GameState {
		return this._state;
	}

	get score (): number {
		return this._score;
	}

	init (): void {
		this._state = GameState.TITLE;
		this._score = 0;
		this._timer = this._baseTimerScore;
	}

	playState (): void {
		this._state = GameState.PLAYING;
	}

	gameOverState (): void {
		this._state = GameState.GAMEOVER;
	}

	update (time: number, dt: number): void {
		this._timer -= dt * 0.6;
		if (this._timer <= 0) {
			this._score += this._baseScore;
			this._event.emit(EventNames.onScoreChange, this._score);
			this._timer += this._baseTimerScore;
		}
	}

	onScoreChange (events: OnScoreChange): void {
		this._event.on(EventNames.onScoreChange, events);
	}

}