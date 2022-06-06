#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/comment_updater
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

const fs = require('fs')

/**
 * Font colors
 */
 const colors = {
    RED:    `\x1b[31m`,
    GREEN:  `\x1b[32m`,
    YELLOW: `\x1b[33m`,
    CYAN:   `\x1b[36m`,
    DIM:    `\x1b[2m`,
    CLEAR:  `\x1b[0m`
}

/**
 * Constants
 */
const constants = {
    SETTINGS_FILE: `.comment_updater_config.json`,
    DAY: null,
    MONTH: null,
    YEAR: null
}

/**
 * Display an error message and exit script.
 * @param {String} message Message to display.
 */
const scriptError = (message) => {
    process.stdout.write(`${colors.RED}Error:  ${message}  Exiting...${colors.CLEAR}\n`)
    process.exit(1)
}

/**
 * Load local settings file
 * @returns Settings JSON object
 * @throws Error on fail then exits script
 */
const loadSettings = () => {
    try {
        return JSON.parse(fs.readFileSync(
            `${process.cwd()}/${constants.SETTINGS_FILE}`))
    } catch (err) {
        scriptError(`Can't find a local '${constants.SETTINGS_FILE}' configuration file.`)
    }
}

/**
 * Set the date variables in constants to current values
 */
const setDate = () => {
    const date = new Date()
    constants.DAY = date.getDate()
    constants.MONTH = date.getMonth()
    constants.YEAR = date.getFullYear()
}

/*
 * Main script
 */
process.stdout.write(`${colors.CYAN}Comment Updater Script${colors.CLEAR}\n\n`)

const settings = loadSettings()
setDate()

//  Run each job
settings['jobs'].forEach(job => {
    //
})

process.stdout.write(`\n${colors.GREEN}Done!${colors.CLEAR}\n`)