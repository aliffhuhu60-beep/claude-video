import json,base64,html
T=json.load(open('slide_times.json'))
names={'03':'Tajuk syarahan','04':'Penghargaan','06':'Peta syarahan','07':'Imbasan Tugasan 2: lima tradisi','08':'Isu pilihan','10':'Konsep masyarakat majmuk','11':'Petikan Furnivall (1948)','12':'Petikan Shamsul Amri (2012)','13':'Tiga lapisan isu','15':'Carta IPNas','17':'Belia: 43% → 58%','18':'Petikan Ibrahim Suffian','16':'Suara belia','20':'Carta 3R MCMC','19':'Ruang digital','22':'Carta murid Bumiputera di SJK(C)','21':'Corak persekolahan','23':'Hipotesis Hubungan Allport','24':'Menolak naratif mudah','25':'Membaca bukti secara kritis','26':'Kembali kepada konsep insan','27':'Petikan al-Hujurat 49:13','29':'Kerangka BINA','30':'B · Bilik darjah responsif budaya','31':'I · Interaksi bermakna','32':'N · Protokol SEMAK','33':'A · Akauntabiliti & komuniti','34':'Pelan pelaksanaan & etika','36':'Rumusan','38':'Petikan pendirian','37':'Pendirian & terima kasih'}
rows=''
for t,p in T:
    if p=='blank':
        rows+='<div class="sl"><div class="ph">Wajah penuh</div><div><span class="tc">0:00</span>Salam dan pengenalan diri, dengan kad nama</div></div>'; continue
    src='data:image/jpeg;base64,'+base64.b64encode(open(f'slth/p{p}.jpg','rb').read()).decode()
    rows+=f'<div class="sl"><img src="{src}" alt="Slaid {html.escape(names[p])}" loading="lazy"><div><span class="tc">{int(t//60)}:{int(t%60):02d}</span>{html.escape(names[p])}</div></div>'
rows+='<div class="sl"><div class="ph">Rujukan</div><div><span class="tc">21:36</span>Halaman Rujukan penuh skrin, 7 saat di hujung video</div></div>'
open('slrows.html','w').write(rows)
