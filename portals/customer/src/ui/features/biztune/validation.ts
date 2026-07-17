import { WizardData } from "./types";
import { isEmpty } from "../../../utils/helpers";

/**
 * Returns the list of Swahili error messages blocking the given (0-based) step.
 * An empty array means the step is valid and the user can continue.
 */
export function getStepErrors(step: number, data: WizardData): string[] {
  const errors: string[] = [];

  switch (step) {
    case 0: // Personal
      if (isEmpty(data.contactPersonName)) errors.push("Jina lako linahitajika");
      if (isEmpty(data.contactPhone)) errors.push("Namba ya simu inahitajika");
      break;

    case 1: // Business
      if (isEmpty(data.businessName)) errors.push("Jina la biashara linahitajika");
      if (isEmpty(data.offerItems)) errors.push("Orodhesha bidhaa/huduma unazotoa");
      if (isEmpty(data.location)) errors.push("Eneo la biashara linahitajika");
      break;

    case 2: // Script
      if (isEmpty(data.voiceScript)) errors.push("Chagua au andika script ya tangazo");
      break;

    case 3: // Voice
      if (isEmpty(data.voiceType)) errors.push("Chagua sauti");
      break;

    case 4: // Review & approve
      if (isEmpty(data.voiceScript)) errors.push("Hakuna tangazo la kukubali");
      break;

    case 5: // Package
      if (isEmpty(data.selectedPackage)) errors.push("Chagua kifurushi");
      break;

    case 6: // Phones
      if (data.phones.filter((p) => !isEmpty(p)).length === 0)
        errors.push("Ongeza angalau namba moja ya simu");
      break;

    case 7: // Payment
      if (isEmpty(data.paymentPhone)) errors.push("Namba ya malipo inahitajika");
      if (!data.agreedToTerms) errors.push("Tafadhali kubali Vigezo na Masharti");
      break;
  }

  return errors;
}
