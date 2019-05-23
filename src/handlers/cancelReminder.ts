import handlers, { Handler } from './index'
import { logger, translation } from '../utils'
import {
    flowContinueTerminate,
    nextOptions,
    ReminderSlots,
    extractSltos
} from './common'
import { Reminder } from '../class/Reminder'
import { i18nFactory } from '../factories'

export const cancelReminderHandler: Handler = async function(
    msg,
    flow,
    database,
    options
) {
    logger.debug('cancelReminder')
    const i18n = i18nFactory.get()
    // Add handler for intentNotRecognized
    flow.notRecognized((_, flow) => {
        return handlers.cancelReminder(
            msg,
            flow,
            database,
            nextOptions(options, slots)
        )
    })

    // Extract slots
    const slots: ReminderSlots = extractSltos(msg, options)
    logger.debug(slots)
    // Get reminders
    const reminders: Reminder[] = database.get({
        name: slots.reminderName || undefined,
        datetimeRange: slots.datetimeRange || undefined,
        recurrence: slots.recurrence || undefined
    })

    logger.debug(reminders)

    // No reminders, no slots
    if (!reminders.length && !Object.keys(slots).length) {
        flow.end()
        return translation.getRandom('getReminder.info.noReminderFound')
    }

    // No reminders, slots detected
    if (!reminders.length && Object.keys(slots).length) {
        flow.continue(`${options.intentPrefix}Yes`, (msg, flow) => {
            return handlers.setReminder(
                msg,
                flow,
                database,
                nextOptions(options, slots)
            )
        })
        flow.continue(`${options.intentPrefix}No`, (msg, flow) => {
            flow.end()
            return
        })
        flowContinueTerminate(flow)
        flow.notRecognized((_, flow) => {
            return handlers.getReminder(
                msg,
                flow,
                database,
                nextOptions(options, slots)
            )
        })
        return (
            translation.getRandom('getReminder.info.noSuchRemindersFound') +
            translation.getRandom('setReminder.ask.createReminder')
        )
    }

    // Found reminders by using some of the constrains, no need to continue just cancel
    if (reminders.length && Object.keys(slots).length > 0) {
        reminders.forEach(reminder => {
            database.deleteById(reminder.id)
        })

        flow.end()
        return i18n('cancelReminder.info.confirm')
    }

    // Cancel all the reminder, need to be confirmed
    if (reminders.length && Object.keys(slots).length === 0) {
        flow.continue(`${options.intentPrefix}Yes`, (_, flow) => {
            reminders.forEach(reminder => {
                database.deleteById(reminder.id)
            })
            flow.end()
            return i18n('cancelReminder.info.confirm')
        })
        flow.continue(`${options.intentPrefix}No`, (_, flow) => {
            flow.end()
        })
        flowContinueTerminate(flow)
        flow.notRecognized((_, flow) => {
            return handlers.cancelReminder(
                msg,
                flow,
                database,
                nextOptions(options, slots)
            )
        })
        const length = reminders.length
        return i18n('cancelReminder.ask.confirm', {
            number: length,
            odd: length > 1 ? 's' : ''
        })
    }

    flow.end()
    throw new Error('setReminderUnhandled')
}