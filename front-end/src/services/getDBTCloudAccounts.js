export async function getDBTCloudAccounts(user) {
    console.log(user);
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/get_dbt_cloud_accounts', {
        method: 'GET', 
        headers: {
                Authorization: "Token " + user.token
            }
    })
    return await response;
}