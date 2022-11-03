export class ClosedEndedQuestion {
  constructor (id, question, answers, correctAnswer, creator, created, comments, status) {
    this.id = id
    this.question = question
    this.answers = answers
    this.correctAnswer = correctAnswer
    this.creator = creator
    this.created = created
    this.comments = comments
    this.status = status
  }
}

export const states = {
  new: 'neu',
  approved: 'genehmigt',
  declined: 'abgelehnt'
}

// Firestore data converter
export const ClosedEndedQuestionConverter = {
  toFirestore: (closedEndedQuestion) => {
    return {
      frage: closedEndedQuestion.question,
      antworten: closedEndedQuestion.answers,
      richtig: closedEndedQuestion.correctAnswer,
      ersteller: closedEndedQuestion.creator,
      erstellt: closedEndedQuestion.created,
      kommentare: closedEndedQuestion.comments,
      status: closedEndedQuestion.status
    }
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options)
    return new ClosedEndedQuestion(snapshot.id, data.frage, data.antworten, data.richtig, data.ersteller, data.erstellt, data.kommentare, data.status)
  }
}