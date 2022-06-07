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
    LOG_FILE: `.comment_updater.log`,
    DAY: null,
    MONTH: null,
    YEAR: null,
    VERBOSE: false,
    LOG: true
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
 * Write a message to the log file
 * @param {String} message String to write
 * @throws Error on fail then exits script
 */
const writeLog = (message) => {
    try {
        fs.appendFileSync(`${process.cwd()}/${constants.LOG_FILE}`, message)
    } catch (err) { scriptError(err) }
}

/**
 * Process a single file
 * @param {String} sourceFile Filename to edit
 * @param {Object} commentBlock The comment block object
 */
const processFile = (sourceFile, commentBlock) => {
    if(constants.VERBOSE) process.stdout.write(`Processing file:  ${sourceFile}...  `)
    if(constants.LOG) writeLog(`Processing file:  ${sourceFile}...  `)

    try{
        //  Update comment block with current filename
        const sourceFileName = sourceFile.substring(1 + sourceFile.lastIndexOf('/'))
        commentBlock.block = commentBlock.block.replaceAll('$CURRENT_FILENAME', sourceFileName)

        //  Format new comment block
        var newBlock = commentBlock.block.split('\n')
        for(let i = 0; i < newBlock.length; i++) {
            newBlock[i] = `${commentBlock.delimiter}${newBlock[i]}`
        }

        var sourceData = fs.readFileSync(sourceFile, 'utf-8').split('\n')

        //  Find start/end of top comment block
        const startIDX = sourceData.findIndex(item => item == commentBlock.start)
        const endIDX = sourceData.findIndex(item => item == commentBlock.end)

        //  Splice in the new block
        sourceData.splice(startIDX + 1, endIDX - 1, ...newBlock)

        fs.unlinkSync(sourceFile)
        fs.appendFileSync(sourceFile, sourceData.join('\n'))
    } catch (err) {
        if(constants.LOG) writeLog(`ERROR!\n\n${err}\n\nScript canceled!`)
        throw err
    }

    if(constants.VERBOSE) process.stdout.write(`${colors.GREEN}Done!${colors.CLEAR}\n`)
    if(constants.LOG) writeLog(`Done!\n`)
}

/**
 * Process each job
 * @param {Object} job An object representing the job task
 */
const runJob = (job) => {
    if(job['job'] === undefined || job['block'] === undefined ||
       job['location'] === undefined || job['extension'] === undefined)
        scriptError(`Invalid job format.`)

    var commentBlock = {}

    if(constants.VERBOSE) process.stdout.write(`${colors.YELLOW}Running job ${job['job']}...${colors.CLEAR}\n\n`)
    if(constants.LOG) writeLog(`Running job ${job['job']}...\n\n`)

    //  Find a matching comment block
    settings['comment_blocks'].forEach(block => {
        if(block['name'] == job['block']) {
            commentBlock.block = block['block']
            commentBlock.start = block['comment_start']
            commentBlock.end = block['comment_end']
            commentBlock.delimiter = block['line_delimiter']
            return
        }
    })
    if(commentBlock == null) scriptError(`No matching comment block found with name '${job['block']}'.`)

    //  Update comment block with variable values
    commentBlock.block = commentBlock.block.replaceAll('$MM', constants.MONTH)
    commentBlock.block = commentBlock.block.replaceAll('$DD', constants.DAY)
    commentBlock.block = commentBlock.block.replaceAll('$YYYY', constants.YEAR)
    if(settings['author']) commentBlock.block = commentBlock.block.replaceAll('$AUTHOR', settings['author'])
    if(settings['version']) commentBlock.block = commentBlock.block.replaceAll('$VERSION', settings['version'])

    /**
     * Run a recursive job
     * @param {String} location Initial location to start
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
        if(job['recursive']) recursiveJob(job['location'])
        else
            fs.readdirSync(job['location']).forEach(item => {
                if(item.search(job['extension']) != -1)
                    processFile(`${job['location']}/${item}`, commentBlock)
            })
    } catch (err) { scriptError(err) }

    if(constants.LOG) writeLog(`\n--------------------------------------------------\n\n`)
}

/*
 * Main script
 */
process.stdout.write(`${colors.CYAN}Comment Updater Script${colors.CLEAR}\n\n`)

const settings = loadSettings()
setDate()

//  Verify comment blocks are configured properly
settings['comment_blocks'].forEach(block => {
    if(block['block'] === undefined || block['comment_start'] === undefined ||
       block['comment_end'] === undefined || block['line_delimiter'] === undefined)
        scriptError('Invalid comment block format.')
})

if(settings['verbose']) constants.VERBOSE = true
if(settings['nologging']) constants.LOG = false

if (constants.LOG) {
    //  Remove old log file
    try {
        fs.unlinkSync(`${process.cwd()}/${constants.LOG_FILE}`)
    } catch (err) {}

    //  Create new log file
    const date = new Date()
    const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()]
    const [hour, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()]
    writeLog(`Comment Updater Script Log File\n`)
    writeLog(`Last ran: ${month}-${day}-${year} ${hour}:${minutes}:${seconds}\n\n`)
}

//  Run each job
settings['jobs'].forEach(job => { runJob(job) })

process.stdout.write(`\n${colors.GREEN}Done!${colors.CLEAR}\n`)