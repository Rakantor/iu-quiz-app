export class OpenEndedQuestion {
  constructor (id, question, solution, creator, created, helpful, difficulty) {
    this.id = id
    this.question = question
    this.solution = solution
    this.creator = creator
    this.created = created
    this.helpful = helpful || []
    this.difficulty = {
      easy: difficulty.leicht || [],
      medium: difficulty.mittel || [],
      hard: difficulty.schwer || []
    }
    this.updateDifficultyLevel()
  }

  updateDifficultyLevel () {
    const easyCount = this.difficulty.easy.length
    const mediumCount = this.difficulty.medium.length
    const hardCount = this.difficulty.hard.length

    if (hardCount > 0 && hardCount >= mediumCount && hardCount >= easyCount) this.difficultyLevel = 3
    else if (mediumCount > 0 && mediumCount >= hardCount && mediumCount >= easyCount) this.difficultyLevel = 2
    else if (easyCount > 0 && easyCount >= hardCount && easyCount >= mediumCount) this.difficultyLevel = 1
    else this.difficultyLevel = null
  }

  getDifficultyString () {
    switch (this.difficultyLevel) {
      case 1: return 'Leicht'
      case 2: return 'Mittel'
      case 3: return 'Schwer'
      default: return 'Unbewertet'
    }
  }
}

// Firestore data converter
export const OpenEndedQuestionConverter = {
  toFirestore: (openEndedQuestion) => {
    return {
      frage: openEndedQuestion.question,
      musterloesung: openEndedQuestion.solution,
      ersteller: openEndedQuestion.creator,
      erstellt: openEndedQuestion.created,
      hilfreich: openEndedQuestion.helpful,
      schwierigkeit: {
        leicht: openEndedQuestion.difficulty.easy,
        mittel: openEndedQuestion.difficulty.medium,
        schwer: openEndedQuestion.difficulty.hard
      }
    }
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    return new OpenEndedQuestion(snapshot.id, data.frage, data.musterloesung, data.ersteller, data.erstellt, data.hilfreich, data.schwierigkeit)
  }
}