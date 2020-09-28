
export function raise404() {
    raiseError('Not found', 404)
}
export function raise403(msg) {
    raiseError(msg, 403)
}
export function raise400(msg) {
    raiseError(msg, 400)
}
export function raiseError(msg, status = null) {
    let error = new Error(msg)
    error.status = status || 500
    throw error
}
export function handleError(err, res) {
    if (!err) {
        err = new Error()
    }
    let { status, message } = err
    if (!status) {
        status = 500
        message = 'Internal Server Error'
    }
    if (status === 404 && !message) {
        message = 'Not found'
    } else if (status === 403 && !message) {
        message = 'Unauthorized access'
    } else if (status < 500 && !message) {
        message = 'Request data is invalid'
    } else if (!message) {
        message = 'Internal Server Error'
    }
    if (status >= 500) {
        console.error(err)
    }
    if (res) {
        res.status(status).json({ error: message, status: status })
    }
}