import { Component } from '@angular/core';

@Component({
  selector: 'app-data-deletion',
  template: `
    <div class="container">
      <h1>{{ appName }} — Data Deletion Instructions</h1>

      <p class="lead">
        هذه الصفحة تشرح كيف يمكن للمستخدمين طلب حذف البيانات الشخصية المرتبطة بتطبيق
        <strong>{{ appName }}</strong>. أضف هذا الرابط لحقل "User data deletion" في إعدادات تطبيق فيسبوك.
      </p>

      <h2>How to request deletion</h2>
      <p>
        لطلب حذف بياناتك الشخصية تواصل مع فريق الدعم عبر التفاصيل أدناه. ضع في الرسالة
        المعلومات الموجودة في قالب الإيميل حتى نتمكن من العثور على حسابك وحذفه بسرعة.
      </p>

      <h3>Contact</h3>
      <p>
        <strong>Email:</strong>
        <a [href]="'mailto:' + contactEmail">{{ contactEmail }}</a>
      </p>

      <p><strong>Or send a request using this template:</strong></p>

      <pre>
Subject: Data Deletion Request — {{ appName }}

Hello {{ appName }} team,

Please delete all personal data associated with my account.

Full name: [Your full name]
Email (used in app): [your-email]
Phone (optional): [phone number]
Username / User ID (if known): [your-username-or-id]
Reason (optional): [optional reason]

Please confirm when deletion is complete.

Thank you,
[Your name]
      </pre>

      <h2>What we'll remove</h2>
      <ol>
        <li>User profile information (name, email, profile picture) stored by {{ appName }}.</li>
        <li>Bookings, reservations, or other records tied to your account (unless legally required to retain some records).</li>
        <li>Personal preferences and app-specific metadata.</li>
      </ol>

      <div class="note">
        <strong>Important:</strong>
        سنزيل البيانات الشخصية من الأنظمة النشطة؛ لكن بعض البيانات (تحليلات مجهولة، نسخ احتياطية مؤقتة،
        أو سجلات مطلوب الاحتفاظ ببعضها قانونياً) قد تبقى لفترة قصيرة. سوف نحذف البيانات من النسخ الاحتياطية وفق سياسة الاحتفاظ.
      </div>

      <h2>Third-party data & revoking access</h2>
      <p>
        إذا سجلت الدخول باستخدام حساب طرف ثالث (مثلاً Facebook)، عليك أيضاً إلغاء صلاحية التطبيق من إعدادات ذلك الحساب.
        لإلغاء صلاحية على فيسبوك: <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener">Facebook → Apps and Websites</a>.
      </p>

      <h2>Timeframe & confirmation</h2>
      <p>
        سنعترف باستلام طلبك خلال <strong>{{ ackDays }} business days</strong> ونسعى لإكمال الحذف خلال
        <strong>{{ deleteDays }} days</strong>. بعد الانتهاء سنرسل رسالة تأكيد إلى البريد الذي أدخلته في الطلب.
      </p>

      <h2>Data protection officer / contact</h2>
      <p>
        لأسئلة إضافية تواصل مع مسؤول حماية البيانات:
        <br /><strong>Email:</strong>
        <a [href]="'mailto:' + contactEmail">{{ contactEmail }}</a>
      </p>

      <!-- <h2>Hosting this file on GitHub Pages (step-by-step)</h2>
      <ol>
        <li>Create a new GitHub repository (public is fine) — e.g. <code>trips-privacy</code>.</li>
        <li>Create a new file named <code>deletion.html</code> in the repo root and paste the contents of this file into it. Commit the change.</li>
        <li>Go to the repository <strong>Settings → Pages</strong>. Under <em>Source</em> choose the branch (usually <code>main</code>) and folder <code>/ (root)</code>, then click <strong>Save</strong>.</li>
        <li>Wait a minute. Your page will be available at:
          <br><code>https://&lt;your-github-username&gt;.github.io/trips-privacy/deletion.html</code>
        </li>
        <li>Copy that URL and paste it into Facebook Developers → your app → <strong>Settings → Basic → User data deletion</strong>.</li>
      </ol>

      <h2>Things to customize</h2>
      <ul>
        <li>Adjust the expected timeframes ({{ ackDays }} business days / {{ deleteDays }} days) to reflect your real policy.</li>
        <li>If لديك API لحذف الحساب (مثلاً <code>/api/delete-account</code>) أضف معلومات عن طريقة التحقق والرابط الآمن هنا.</li>
      </ul>

      <footer>
        <p>
          Generated for <strong>{{ appName }}</strong>. Update the contact email and timeframe before publishing.
          If you want, I can create the GitHub repo and commit this file for you — قل لي اسم المستخدم على GitHub أو اعطني صلاحية.
        </p>
      </footer> -->
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        font-family: Inter, system-ui, 'Segoe UI', Roboto, Arial, sans-serif;
        color: #222;
        background: #f6f7fb;
        padding: 20px;
      }
      .container {
        max-width: 760px;
        margin: 24px auto;
        padding: 24px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 8px 30px rgba(30, 30, 60, 0.06);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 22px;
      }
      p.lead {
        margin: 0 0 18px;
        color: #445;
      }
      h2 {
        font-size: 16px;
        margin-top: 22px;
      }
      ol {
        margin-left: 18px;
      }
      pre {
        background: #f3f4f8;
        padding: 12px;
        border-radius: 6px;
        overflow: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .note {
        background: #fff7e6;
        padding: 12px;
        border-left: 4px solid #ffd45a;
        margin: 12px 0;
        border-radius: 6px;
      }
      a {
        color: #0b63d6;
        text-decoration: underline;
      }
      footer {
        margin-top: 26px;
        color: #666;
        font-size: 13px;
      }
    `
  ]
})
export class DeletionComponent {
  appName = 'Trips';
  contactEmail = 'seyam.ayoub@impact.eg';
  ackDays = 5;
  deleteDays = 30;
}
