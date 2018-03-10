"use strict"

const React = require('react')
const journalService = require('../../services/journal.events.service')
const appointmentEventsService = require('../../services/appointment.events.service')
const authenticationService = require('../../services/authentication.service')
const JournalCalendar = require('../shared/JournalCalendar')

class UserJournal extends React.PureComponent {
    constructor(props, context) {
        super(props, context)

        this.updateEvents = this.updateEvents.bind(this)

        this.state = {
            events: [],
            appointments: [],
        }
    }

    componentDidMount() {
        journalService.readByUserId(this.props.urlParams.userId)
            .then(response => {
                this.setState({
                    events: response.item
                })
            })
            .catch(err => console.warn(err))

        let user = (authenticationService.getCurrentUser())
        if (user.userType !== "Therapist") { return }
        else {
            appointmentEventsService.readByUserId(this.props.urlParams.userId, user.userId)
                .then(data => {
                    this.setState({
                        appointments: data.items
                    })
                })
                .catch(err => console.warn(err))
        }
    }

    updateEvents(dataFromChild){
        console.log(dataFromChild)
        let newEvent = this.state.events
        newEvent.push(dataFromChild)
        this.setState({
            events: newEvent.slice()
        })
    }

    render() {
        return (
            <div>
                <JournalCalendar onFormSubmit={this.updateEvents}  angularUrl={this.props.angularUrl} userId={this.props.urlParams.userId} journalId={this.props.urlParams.id} events={this.state.events} appointments={this.state.appointments}></JournalCalendar>
            </div>
        )
    }
}

module.exports = UserJournal