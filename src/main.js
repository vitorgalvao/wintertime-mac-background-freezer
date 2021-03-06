const { name } = require( `${__dirname}/../package.json` )
const { ipcRenderer } = require( 'electron' )

const q = query => document.querySelector( query )

// ///////////////////////////////
// Initialisation
// ///////////////////////////////
document.addEventListener( 'DOMContentLoaded',  f => {

	// Inits
	setTitle()
	restoreConfig()

	// Visual listeners
	interactiveHelp()
	interactiveInterface()

	// Functionality
	handleInteractions()

} )


// Set title to app name
const setTitle = f => ( document.title = name ) && ( q('#title' ).innerHTML = name )

// IPC comms
const restoreConfig = f => {
	// On restore response, parse data
	ipcRenderer.on( 'restored-config-data', ( event, restoredBlocklist ) => {

		// Turn the comma separated string into a newline delimited string
		restoredBlocklist = restoredBlocklist.replace( /,/g, '\n' )
		const blocklist = q( '#blocklist' )
		blocklist.value = restoredBlocklist
		blocklist.style.height = `${ blocklist.scrollHeight }px`
	} )
	// make restore request
	ipcRenderer.send( 'restore-config', true )
}

const interactiveHelp = f => {
	const helpfield = q( '#help' )
	q( '#askhelp').addEventListener( 'click' , f => {
		helpfield.style.display == 'none' ? helpfield.style.display = 'block' : helpfield.style.display = 'none'
	} )
}

const interactiveInterface =  f => {

	// Resize test window
	const blocklist = q( '#blocklist' )
	blocklist.style.height = `${ blocklist.scrollHeight }px`
	blocklist.addEventListener( 'keyup', ( { target } ) => target.style.height = `${ target.scrollHeight }px` )

}

const handleInteractions = f => {

	const submitFormData = f => {

		const form = q( '#form' )

		if( process.env.debug ) console.log( 'Form submit triggered' ) 
		const { value } = form.blocklist
		const button = q( '#start' )
		button.value = button.value.includes( 'Start' ) ? 'Stop freezing' : 'Start freezing'
		
		ipcRenderer.send( 'block', value.split( '\n' ) )
	}

	// On form submit
	form.addEventListener( 'submit',  e => {
		e.preventDefault()
		submitFormData()
	} )

	// On panic
	q( '#panic' ).addEventListener( 'click', f => ipcRenderer.send( 'panic', true ) )

	// On backend keyboard shortcuit
	ipcRenderer.on( 'keyboard-shortcut', ( event, content ) => {
		if( process.env.debug ) console.log( content )
		if( content == 'toggle-block' ) submitFormData()
	} )

}