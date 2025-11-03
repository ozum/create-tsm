import sodium from "libsodium-wrappers";

export async function createRepositorySecret(
	key: string,
	secret: string,
): Promise<string> {
	await sodium.ready;

	// Convert Secret & Base64 key to Uint8Array.
	const binkey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
	const binsec = sodium.from_string(secret);

	// Encrypt the secret using LibSodium
	const encBytes = sodium.crypto_box_seal(binsec, binkey);

	// Convert encrypted Uint8Array to Base64
	return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);
}
