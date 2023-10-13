import { Installer } from '@youwol/os-core'
import { install as basicInstall } from '../basic'

export async function install(installer: Installer): Promise<Installer> {
    return installer.with({
        fromInstallingFunctions: [basicInstall],
        fromLibraries: ['@youwol/installers-stories.basic'],
        fromManifests: [
            {
                id: '@youwol/installers.youwol-users',
                favorites: {
                    items: [
                        'MzlhYzBkYWItYTA3Mi00ZmEyLTk4YjgtN2I5OTY3YjZlYjQz', // stories YouWol
                        'OWU2NjQ1MjUtMWRhYy00NWFmLTgzYzYtZjRiNGVmMzg2NmFm', // stories py-youwol
                    ],
                },
            },
        ],
    })
}
