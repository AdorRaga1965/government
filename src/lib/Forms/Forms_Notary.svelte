<script lang="ts">
  export let seller_fullname: string;
  export let seller_address: string;
  export let buyer_fullname: string;
  export let buyer_address: string;

  export let make: string;
  export let body_type: string;
  export let model: string;
  export let chassis_no: string;
  export let plate_no: string;
  export let file_no: string;
  export let amount: string;
  export let location = 'Binangonan, Rizal'; // optional
  export let date_str = new Date().toLocaleDateString('en-PH', { dateStyle: 'long' }); // optional
</script>

<div class="prose max-w-none p-4 text-sm leading-relaxed">
  <h2 class="text-center font-bold text-lg mb-4">DEED OF SALE OF MOTOR VEHICLE</h2>

  <p>KNOW ALL MEN BY THESE PRESENTS:</p>

  <p>
    I, <strong>{seller_fullname}</strong>, of legal age, Filipino, and resident of <strong>{seller_address}</strong>,
    am the owner of a motor vehicle particularly described as follows:
  </p>

  <ul class="ml-4 list-disc">
    <li>Make: {make}</li>
    <li>Body Type: {body_type}</li>
    <li>Model: {model}</li>
    <li>Chassis No.: {chassis_no}</li>
    <li>Plate No.: {plate_no}</li>
    <li>File No.: {file_no}</li>
  </ul>

  <p>
    That for and in consideration of the sum of <strong>{amount}</strong> Philippine currency,
    to me in hand paid and acknowledged from <strong>{buyer_fullname}</strong>, of legal age, Filipino,
    and resident of <strong>{buyer_address}</strong>, I hereby SELL, TRANSFER, and CONVEY unto said
    <strong>{buyer_fullname}</strong> the aforementioned motor vehicle.
  </p>

  <p>
    IN WITNESS WHEREOF, I have hereunto set my hand this <u>____</u> day of <u>_____________</u>,
    in <u>{location}</u>.
  </p>

  <div class="grid grid-cols-2 gap-8 mt-6 text-center">
    <div>
      <p class="font-bold uppercase">{seller_fullname}</p>
      <p>VENDOR</p>
    </div>
    <div>
      <p class="font-bold uppercase">{buyer_fullname}</p>
      <p>VENDEE</p>
    </div>
  </div>

  <p class="mt-6">Signed in the presence of:</p>
  <div class="grid grid-cols-2 gap-8 mt-2">
    <div><u>__________________________</u></div>
    <div><u>__________________________</u></div>
  </div>

  <hr class="my-6 border-t border-gray-400" />

  <h3 class="text-center font-semibold">ACKNOWLEDGMENT</h3>
  <p class="mt-2">
    REPUBLIC OF THE PHILIPPINES<br/>
    CITY OF ____________________ ) S.S.<br/>
    x----------------------------------------------x
  </p>

  <p>
    BEFORE ME, this ___ day of __________, in the Municipality of ____________, Province of ____________, Philippines,
    personally appeared ____________________, known to me to be the same person who executed the foregoing instrument
    and acknowledged to me that the same is his/her free and voluntary act and deed.
  </p>

  <p>IN WITNESS WHEREOF, I have hereunto set my hand and affixed my notarial seal on the day, year, and place above written.</p>

  <div class="mt-4 text-sm">
    <p>Name: ___________________________</p>
    <p>Notary Public for [Municipality/City/Province]</p>
    <p>Office Address: ___________________________</p>
    <p>Appointment No. ______ Until ______</p>
    <p>Roll of Attorneys No. ______</p>
    <p>PTR No. ______; [Date][Place]</p>
    <p>IBP No. ______; [Date][Chapter]</p>
    <p class="mt-2">Doc. No. ____;<br/>Page No. ____;<br/>Book No. ____;<br/>Series of {new Date().getFullYear()}.</p>
  </div>
</div>

<style>
  .prose p {
    margin-bottom: 0.75rem;
  }
</style>
