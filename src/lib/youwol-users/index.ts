import { Installer } from '@youwol/os-core'
import { install as basicInstall } from '../basic'

export async function install(installer: Installer): Promise<Installer> {
    return installer.with({
        fromInstallingFunctions: [basicInstall],
        fromLibraries: [],
        fromManifests: [
            {
                id: '@youwol/installers.youwol-users',
                favorites: {
                    items: [],
                    applications: [
                        // Ids are the name of the application (e.g. '@youwol/galapagos')  encoded b64 2 times
                        'UUhsdmRYZHZiQzluWVd4aGNHRm5iM009', // '@youwol/galapagos'
                        'UUhsdmRYZHZiQzl6Y0dGdWFYTm9MWEJsWVd0eg==', // '@youwol/spanish-peaks'
                        'UUhsdmRYZHZiQzlpZFc1dWVTMXlaVzFsYzJnPQ==', // '@youwol/bunny-remesh'
                    ],
                },
            },
        ],
    })
}
