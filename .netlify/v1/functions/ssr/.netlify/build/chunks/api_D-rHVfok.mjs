//#region src/lib/api.ts
var BASE_URL = "https://vwdwpswpvqdfpsrkmgzy.supabase.co/functions/v1";
var TOKEN = "sb_publishable_yI6-VfmXaCmbr7E8GCq6zg_zTUe-rMB";
var ADMIN_PASSWORD = "A123456";
console.log("https://vwdwpswpvqdfpsrkmgzy.supabase.co/functions/v1");
function getHeaders() {
	console.log({ ADMIN_PASSWORD });
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${TOKEN}`,
		"x-admin-password": ADMIN_PASSWORD
	};
}
async function getEngineers(from = "", to = "", admin_id = "") {
	return (await fetch(`${BASE_URL}/list-eng`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({
			from,
			to,
			admin_id
		})
	})).json();
}
async function getEngineer(engineer_id, from = "", to = "") {
	return (await fetch(`${BASE_URL}/engineer-details`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({
			engineer_id,
			from,
			to
		})
	})).json();
}
async function verifyPhoto(photo_tag, signature) {
	return (await fetch(`${BASE_URL}/verify-photo`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({
			photo_tag,
			signature
		})
	})).json();
}
async function getDashboard(from = "", to = "", admin_id = "") {
	return (await fetch(`${BASE_URL}/dashboard`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({
			from,
			to,
			admin_id
		})
	})).json();
}
console.log("BASE_URL =", BASE_URL);
async function getAdmins(admin_id) {
	return (await fetch(`${BASE_URL}/get-admins`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({ admin_id })
	})).json();
}
//#endregion
export { verifyPhoto as a, getEngineers as i, getDashboard as n, getEngineer as r, getAdmins as t };
