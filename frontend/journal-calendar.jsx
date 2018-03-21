"use strict"

const React = require('react')
const FullCalendar = require('fullcalendar-reactwrapper')
const JournalCalendarForm = require('./JournalCalendar.form')
const JournalDetail = require('./Journal.Detail')
const authenticationService = require('../../services/authentication.service')


class JournalCalendar extends React.PureComponent {
    constructor(props, context) {
        super(props, context)

        this.renderImage = this.renderImage.bind(this)
        this.dayClickEvent = this.dayClickEvent.bind(this)
        this.createEvent = this.createEvent.bind(this)
        this.onCreate = this.onCreate.bind(this)
        this.closeForm = this.closeForm.bind(this)
        this.journalEventClick = this.journalEventClick.bind(this)
        this.handleDetailClose = this.handleDetailClose.bind(this)

        this.state = {
            newEventDate: '',
            resizeForm: 'col-xs-3',
            newEntry: '',
            modal: false,
            eventId: '',
        }
    }

    renderImage(event, element) {
        if (event.icon) {
            let icon = document.createElement('img')
            icon.src = "https://material.io/icons/static/images/icons-180x180.png"
            icon.height = 15
            icon.width = 15
            element.find('div.fc-content').prepend(icon)
        }
    }

    dayClickEvent(date, jsEvent, view) {
        this.setState({
            newEventDate: date,
            modal: true,
            resizeForm: 'col-xs-3 journalFormTransition'
        })
    }

    createEvent(event) {
        let currentDate = new Date()
        currentDate = `${(currentDate.getMonth() + 1)}/${currentDate.getDate()}/${currentDate.getFullYear()}`

        this.setState({
            newEventDate: currentDate.toString(),
            modal: true,
            resizeForm: 'col-xs-3'
        })
    }

    onCreate(dataFromChild) {
        this.props.onFormSubmit(dataFromChild)
    }

    closeForm(dataFromChild) {
        this.setState({
            modal: dataFromChild,
            resizeForm: 'col-xs-3'
        })
    }

    journalEventClick(event) {
        if (event.id && this.props.userId) {
            this.setState({
                eventId: event.id
            })
            this.props.angularUrl("/journal/" + this.props.userId + "/" + event.id)
        }
    }

    handleDetailClose(event) {
        this.props.angularUrl("/journal/" + this.props.userId)
    }

    render() {
        let calendarForm
        if (this.state.modal == true) {
            calendarForm = <JournalCalendarForm eventData={this.state.newEventDate} onCreate={this.onCreate} modal={this.state.modal} showForm={this.closeForm} />
        }

        let eventDetailPanel
        if (this.props.journalId) {
            eventDetailPanel = <JournalDetail urlParams={this.props.journalId} close={this.handleDetailClose}></JournalDetail>
        }

        let customButtons, dayClick
        if (this.props.userId == authenticationService.getCurrentUser().userId) {
            customButtons = {
                createButton: {
                    text: 'Create Event',
                    click: this.createEvent,
                }
            }
            dayClick = this.dayClickEvent
        }
        return (
            <div>
                <div className='row'>
                    <div className="col-md-9">
                        <div className="panel panel-inverse">
                            <div className="panel-heading">
                                <h4 className="panel-title">Calendar</h4>
                            </div>
                            <div className="panel-body">

                                <div>
                                    <FullCalendar
                                        customButtons={customButtons}
                                        header={{
                                            left: 'prev,next today createButton',
                                            center: 'title',
                                            right: 'month,agendaWeek,agendaDay'
                                        }}
                                        defaultDate={new Date()}
                                        navLinks={true}
                                        editable={true}
                                        themeSystem='standard'
                                        eventLimit={true}
                                        events={
                                            this.props.events.map(obj => (
                                                {
                                                    title: obj.title,
                                                    start: obj.eventDate,
                                                    color: '#348fe2',
                                                    id: obj._id
                                                }
                                            )).concat(this.props.appointments.map(appt => (
                                                {
                                                    title: appt.title,
                                                    start: appt.date,
                                                    color: '#00acac'
                                                }
                                            )))
                                        }
                                        eventClick={this.journalEventClick}
                                        eventRender={this.renderImage}
                                        dayClick={dayClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {eventDetailPanel}
                    {calendarForm}
                </div>
            </div>

        )
    }
}

module.exports = JournalCalendar