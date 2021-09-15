import path from "path";
import fs from "fs";

export class WatchResources {

    private default: Array<string> = [
        "daemon"
    ];
    
    constructor (
        private resources: Array<string> = []
    ) {
        this.resources = this.default.concat(this.resources ?? []);
        this.resources.forEach(resourceName => {
            const status = GetResourceState(resourceName);
            if (status === "started" || status === "starting" || status === "stopped" || status === "stopping") {
                if (GetCurrentResourceName() !== resourceName) {
                    console.log(`^2[DEVTOOLS] Start watching resource ${resourceName}^0`);
                    this.ScheduleWatch(resourceName);
                } else {
                    console.log(`^1[DEVTOOLS] Unable to self-watching resource ${resourceName}.^0`);
                }
            } else {
                console.log(`^1[DEVTOOLS] Unable to watch resource ${resourceName}. (Error: ${status} !)^0`);
              }
        });
    }

    /**
     * Schedule resource watching 
     * 
     * @param resourceName 
     */
    private async ScheduleWatch(resourceName: string): Promise<void> {
        let files = [];
        const folder: string = path.resolve(GetResourcePath(resourceName), "dist");
        const folders: Array<string>  = (fs.existsSync(folder)? [
            path.resolve(folder, "client"),
            path.resolve(folder, "server")
        ]: null);
        if (folders !== null) {
            while (typeof resourceName === "string") {
                folders.forEach(folder => {
                    if (fs.existsSync(folder)) {
                        fs.readdirSync(folder).forEach(file => {
                            if (!files.includes(file)) {
                                files = this.ListResourceFiles(folders);
                                console.log(`^4[DEVTOOLS] Restarting resource ${resourceName}^0`);
                                StopResource(resourceName);
                                while (GetResourceState(resourceName) !== "stopped") {
                                    this.sleep(100);
                                }
                                StartResource(resourceName);
                            }
                        });
                    }
                });
                await this.sleep(200);
            }
        } else {
            console.log(`^1[DEVTOOLS] Unable to watch unbuilded resource ${resourceName}. (Error: Missing "dist" folder !)^0`);
        }
    }

    /**
     * List main s files
     * 
     * @param folders 
     * @returns 
     */
    private ListResourceFiles(folders: Array<string>): Array<string> {
        let files: Array<string> = [];
        folders.forEach(folder => {
            if (fs.existsSync(folder)) {
                fs.readdirSync(folder).forEach(file => {
                    files.push(file);
                });
            }
        });
        return files;
    }

    /**
     * Sleep
     * 
     * @param ms 
     * @returns 
     */
    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}