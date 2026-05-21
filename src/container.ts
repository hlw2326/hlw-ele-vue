import { CONTAINER_APPID, getCurrentWindow, send } from '@hlw-ele/core/renderer'
import { useMp } from './mp'

function isMp(appid?: string): boolean {
    return !!appid && appid !== CONTAINER_APPID
}

export function useContainer() {
    const mp = useMp()

    function runMpAction(action: (appid: string) => void): boolean {
        const appid = getCurrentWindow()?.appid
        if (!isMp(appid) || !appid) return false

        action(appid)
        return true
    }

    function min(): void {
        if (runMpAction(mp.min)) return

        getCurrentWindow()?.minimize?.()
    }

    function max(): void {
        if (runMpAction(mp.max)) return

        const current = getCurrentWindow()
        if (!current) return

        current.isMaximized() ? current.unmaximize() : current.maximize()
    }

    function close(): void {
        if (runMpAction(mp.close)) return

        getCurrentWindow()?.close?.()
    }

    function dev(): void {
        if (runMpAction(mp.dev)) return

        send('CONTAINER-DEV')
    }

    return {
        min,
        max,
        close,
        dev
    }
}
