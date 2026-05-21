export function timestamp(): string {
    return new Date().toISOString()
}

/**
 * 字符串首尾去空格辅助函数
 */
export function trim(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}


/**
 * 正则过滤终端输出字符串中的 ANSI 转义颜色及控制高亮字符，
 * 确保日志列表仅显示干净的纯文本。
 */
export function cleanAnsi(str: string): string {
    const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
    return str.replace(ansiRegex, '')
}

/**
 * 彻底销毁并停止正在运行的子进程
 * 
 * 考虑到 Windows 平台通过 shell 启动 `npm run` 等命令时会产生嵌套的子进程树，
 * 单纯调用 child.kill() 无法清理子孙进程从而导致孤儿进程残留。
 * 因此在 Windows 系统下，本函数优先调用底层封装的 `taskkill /pid ... /T /F` 命令直接抹杀整个进程树。
 *
 * @param child 需要被关闭的 Node 子进程实例
 */
export function killProcess(child: any): void {
    if (!child) return
    try {
        const exec = window.hlw.tools.exec
        if (child.pid) {
            // Windows 下强制级联终止进程树 (/T 树形, /F 强制)
            exec(`taskkill /pid ${child.pid} /T /F`)
        } else if (child.kill) {
            // 非 Windows 平台或不支持 exec 时回退到标准 kill
            child.kill()
        }
    } catch (e) {
        console.error('Failed to kill process:', e)
    }
}
