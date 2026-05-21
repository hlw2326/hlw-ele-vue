declare namespace ILog {
    type Level = 'info' | 'success' | 'warning' | 'error'

    interface Item {
        taskId: number
        mpId: number
        mpName: string
        level: Level
        source: 'build' | 'upload' | 'system'
        message: string
        createdAt: string
    }
}
