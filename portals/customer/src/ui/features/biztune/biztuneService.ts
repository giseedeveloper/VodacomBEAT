import { getRequest, postRequest } from "../../../http/RestService";
import { TunePackage, WizardData } from "./types";

/** Remove spaces so numbers entered as "0712 345 678" reach the backend clean. */
function cleanPhone(phone: string): string {
  return (phone || "").replace(/\s+/g, "").trim();
}

/**
 * Packages — EXISTING endpoint.
 * GET /api/v1/tunes/customer/packages  ->  payload.packages[]
 */
export async function fetchPackages(): Promise<TunePackage[]> {
  const response: any = await getRequest("/api/v1/tunes/customer/packages");
  return response?.data?.payload?.packages ?? [];
}

/**
 * Script generation.
 *
 * SEAM: the auto-generation endpoint does not exist yet on the backend, so for
 * now we build two draft variants client-side from the business profile the
 * user just entered. When `POST /api/v1/tunes/customer/script/generate` ships,
 * replace the body of this function with a single postRequest call:
 *
 *   const r: any = await postRequest("/api/v1/tunes/customer/script/generate", {
 *     business_name: data.businessName, offer_type: data.offerType,
 *     offer_items: data.offerItems, location: data.location,
 *   });
 *   return r?.data?.payload?.scripts ?? [];
 *
 * Everything upstream (the wizard, Step3) already treats this as async, so no
 * UI change will be needed when the real endpoint lands.
 */
export async function generateScripts(data: WizardData): Promise<string[]> {
  const name = data.businessName.trim() || "biashara yetu";
  const place = data.location.trim();
  const items = data.offerItems.trim();

  const placePart = place ? `, ${place}` : "";
  const itemsPart = items ? ` Tunatoa ${items}.` : "";

  const variantA =
    `Karibu ${name}${placePart}!${itemsPart} ` +
    `Huduma bora kwa bei nafuu. Piga simu leo — tupo tayari kukuhudumia!`;

  const variantB =
    `Unatafuta bora? ${name} ndio jibu.${itemsPart} ` +
    `${name}${placePart} — tunakuhudumia kwa upendo na uaminifu. Karibu!`;

  return Promise.resolve([variantA, variantB]);
}

export interface AddSubscriptionResult {
  subscriptionReference: string;
}

/**
 * Final submit — EXISTING endpoint.
 * POST /api/v1/tunes/customer/subscription/add creates a pending subscription
 * and kicks off the Selcom mobile-money push to `payment_phone`. It returns the
 * subscription whose `subscription_reference` we use to navigate to StatusPage.
 *
 * The backend only validates the core fields; the extra business-profile fields
 * are forwarded now and simply ignored until the schema is extended.
 */
export async function submitSubscription(
  data: WizardData
): Promise<AddSubscriptionResult> {
  const payload: any = {
    // required by TunesCustomerController::addSubscription
    contact_person_name: data.contactPersonName.trim(),
    contact_phone: cleanPhone(data.contactPhone),
    business_name: data.businessName.trim(),
    payment_phone: cleanPhone(data.paymentPhone),
    subscription_package: data.selectedPackage?.package,
    voice_type: data.voiceType,
    voice_script: data.voiceScript.trim(),
    subscription_phones: data.phones.map(cleanPhone).filter((p) => p !== ""),

    // forward-compatible extras (ignored by current validation)
    business_location: data.location.trim(),
    offer_type: data.offerType,
    offer_items: data.offerItems.trim(),
    social_instagram: data.socials.instagram.trim(),
    social_facebook: data.socials.facebook.trim(),
    social_tiktok: data.socials.tiktok.trim(),
    social_website: data.socials.website.trim(),
    agreed_to_terms: data.agreedToTerms,
  };

  const response: any = await postRequest(
    "/api/v1/tunes/customer/subscription/add",
    payload
  );
  const subscription = response?.data?.payload?.subscription;
  return { subscriptionReference: subscription?.subscription_reference };
}
