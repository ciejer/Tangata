export async function getGenerateSSH(user) {
    const response = await fetch('http://sqlgui.chrisjenkins.nz:3080/api/v1/generate_ssh', {headers: {Authorization: "Token " + user.token}});
    return await response;
}