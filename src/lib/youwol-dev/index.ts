import { Installer } from '@youwol/os-core'
import { install as basicInstall } from '../basic'

export async function install(installer: Installer): Promise<Installer> {
    return installer.with({
        fromLibraries: ['@youwol/installers-vs-flow.basics'],
        fromInstallingFunctions: [basicInstall],
    })
}
