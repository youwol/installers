import { Installer } from '@youwol/os-core'
import { Accounts } from '@youwol/http-clients'
import { raiseHTTPErrors } from '@youwol/http-primitives'
import { map } from 'rxjs/operators'

export * as youwolDevs from './youwol-dev'
export * as youwolUsers from './youwol-users'
export * as youwolAdmins from './youwol-admins'
export * as basic from './basic'

import * as visitors from './visitors'

/**
 * This hard coded dictionary maps a group to its 'installer' package name.
 * At some point, it will be obtained somehow through a request to a backend of YouWol.
 */
const groupsInstaller = {
    '/youwol-users': '@youwol/installers.youwolUsers',
    '/youwol-users/youwol-devs': '@youwol/installers.youwolDevs',
    '/youwol-users/youwol-devs/youwol-admins':
        '@youwol/installers.youwolAdmins',
}
export async function install(installer: Installer): Promise<Installer> {
    const client = new Accounts.Client()
    const installer$ = client.getSessionDetails$().pipe(
        raiseHTTPErrors(),
        map((session) => {
            if (session.userInfo.temp) {
                return visitors.install(installer)
            }
            const fromLibraries = session.userInfo.groups
                .map(({ path }) => groupsInstaller[path])
                .filter((module) => module !== undefined)

            return installer.with({
                fromLibraries,
            })
        }),
    )
    return new Promise((resolve) => {
        installer$.subscribe((installer) => {
            console.log('Installer', installer)
            resolve(installer)
        })
    })
}
