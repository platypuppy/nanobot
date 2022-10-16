const warningLevels = ['', '[Info] ', '[Warning] ', '[ERROR] '];

export enum WarningLevel {
	Notice = 0,
	Info = 1,
	Warning = 2,
	Error = 3,
	Disabled = 4,
}

export class Logger {
	constructor(moduleName: string, minWarningLevel: number) {
		this.moduleName = moduleName;
		this.minWarningLevel = minWarningLevel;
	}

	moduleName: string;
	minWarningLevel: number;

	log(msg: string, warningLevel?: number) {
		if (!warningLevel) warningLevel = 0;

		if (
			warningLevel >= this.minWarningLevel &&
			warningLevel < WarningLevel.Disabled
		) {
			const now = new Date();
			console.log(
				'[' +
					now.getHours() +
					':' +
					now.getMinutes() +
					':' +
					now.getSeconds() +
					'] [moron/' +
					this.moduleName +
					'] ' +
					warningLevels[warningLevel] +
					msg,
			);
		}
	}
}
