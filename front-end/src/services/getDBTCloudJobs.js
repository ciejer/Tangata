export async function getDBTCloudJobs(user, account) {
    console.log(user);
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/get_dbt_cloud_jobs/' + account, {
        method: 'GET', 
        headers: {
                Authorization: "Token " + user.token
            }
    })
    return await response;
}