import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { donorApi } from '../../apiurl';
import axios from 'axios';

function VerifyDonor() {
  const params = useParams();

  useEffect(() => {
    axios.get(donorApi + "fetch?email=" + params.email).then((response) => {
      const donor = response.data[0];
      if (donor && donor.status === 0) {
        const updateDetails = {
          condition_obj: { email: params.email },
          content_obj: { status: 1 }
        };
        axios.patch(donorApi + "update", updateDetails).then(() => {
          console.log("User verified successfully");
          window.location.href = "/login";
        }).catch(err => {
          console.error("Verification update failed", err);
        });
      } else {
        // Already verified or not found
        window.location.href = "/login";
      }
    }).catch(err => {
      console.error("Fetch donor for verification failed", err);
    });
  }, [params.email]);

  return (
    <div className="verify-donor-container">
      <h2>Verifying your account...</h2>
    </div>
  );
}

export default VerifyDonor;
