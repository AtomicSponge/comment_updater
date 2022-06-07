#!/usr/bin/env node
/**
 * @author Matthew Evans
 * @module spongex/comment_updater
 * @see README.md
 * @copyright MIT see LICENSE.md
 */

const fs = require('fs')
const path = require('path')

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
    LOG_FILE: `.comment_updater_$JOB.log`,
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

/**
 * Process a single file
 * @param {String} sourceFile 
 */
const processFile = (sourceFile, commentBlock) => {
    //  Update comment block with current filename
    commentBlock = commentBlock.replaceAll('$CURRENT_FILENAME', 'filename')
    const sourceData = fs.readFileSync(sourceFile, 'utf-8')
}

/**
 * Process each job
 * @param {Object} job An object representing the job task
 */
const runJob = (job) => {
    if(job['job'] === undefined || job['block'] === undefined ||
       job['location'] === undefined || job['extension'] === undefined)
        scriptError(`Invalid job format.`)

    var commentBlock = null

    //  Find a matching comment block
    settings['comment_blocks'].forEach(block => {
        if(block['name'] == job['block']) {
            commentBlock = block['block']
            return
        }
    })
    if(commentBlock == null) scriptError(`No matching comment block found with name '${job['block']}'.`)

    //  Update comment block with variable values
    commentBlock = commentBlock.replaceAll('$MM', constants.MONTH)
    commentBlock = commentBlock.replaceAll('$DD', constants.DAY)
    commentBlock = commentBlock.replaceAll('$YYYY', constants.YEAR)
    if(settings['author']) commentBlock = commentBlock.replaceAll('$AUTHOR', settings['author'])
    if(settings['version']) commentBlock = commentBlock.replaceAll('$VERSION', settings['version'])

    /**
     * Run a recurisve job
     * @param {*} fileList Initial location to start
     */
    const recursiveJob = (location) => {
        const fileList = fs.readdirSync(location, { withFileTypes: "true" })
        fileList.forEach(item => {
            if(item.isDirectory()) recursiveJob(`${location}/${item.name}`)
            else
                if(item.name.search(job['extension']) != -1) {
                    processFile(`${location}/${item.name}`, commentBlock)
                }
        })
    }

    //  Now process each file in the job
    try {
        if(job['recursive']) recursiveJob(job['location'], { withFileTypes: "true" })
        else
            fs.readdirSync(job['location']).forEach(item => {
                if(item.search(job['extension']) != -1)
                    processFile(`${job['location']}/${item}`, commentBlock)
            })
    } catch (err) { scriptError(err) }
}

/*
 * Main script
 */
process.stdout.write(`${colors.CYAN}Comment Updater Script${colors.CLEAR}\n\n`)

const settings = loadSettings()
setDate()

//  Run each job
settings['jobs'].forEach(job => { runJob(job) })

process.stdout.write(`\n${colors.GREEN}Done!${colors.CLEAR}\n`)