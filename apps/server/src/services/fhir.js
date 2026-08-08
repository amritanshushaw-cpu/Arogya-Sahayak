/**
 * Dummy ECDH encryption
 */
function encryptPayload(data) {
  const base64Data = Buffer.from(JSON.stringify(data)).toString('base64');
  return {
    encrypted_data: base64Data,
    fhir_version: 'R4'
  };
}

/**
 * Generates a FHIR R4 Bundle from patient and screening data
 */
function generateFHIRBundle(patient, screening) {
  const bundle = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [
      {
        fullUrl: `urn:uuid:${patient.id || 'dummy-patient-id'}`,
        resource: {
          resourceType: 'Patient',
          id: patient.id || 'dummy-patient-id',
          name: [
            {
              text: patient.name || 'Unknown Patient'
            }
          ]
        }
      },
      {
        fullUrl: `urn:uuid:${screening.id || 'dummy-screening-id'}`,
        resource: {
          resourceType: 'Observation',
          id: screening.id || 'dummy-screening-id',
          status: 'final',
          code: {
            text: 'Health Screening'
          },
          subject: {
            reference: `urn:uuid:${patient.id || 'dummy-patient-id'}`
          }
        }
      }
    ]
  };

  return encryptPayload(bundle);
}

module.exports = {
  generateFHIRBundle
};
