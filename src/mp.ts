import { send } from '@hlw-ele/core/renderer'
import type { AppInfo } from '@hlw-ele/core/types'

export function useMp() {
    function open(app: AppInfo): void {
        send('MP-OPEN', JSON.stringify(app))
    }

    function close(appid: string): void {
        send('MP-CLOSE', appid)
    }

    function min(appid: string): void {
        send('MP-MINUS', appid)
    }

    function max(appid: string): void {
        send('MP-MAXIMIZE', appid)
    }

    function ding(appid: string): void {
        send('MP-DING', appid)
    }

    function dev(appid: string): void {
        send('APP-DEVTOOLS', appid)
    }

    return {
        open,
        close,
        min,
        max,
        ding,
        dev
    }
}
