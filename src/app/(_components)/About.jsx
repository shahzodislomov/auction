"use client"
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Handshake as HandshakeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import Link from 'next/link';

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState({
    header: false,
    mission: false,
    team: false,
    stats: false,
    partners: false,
    contact: false
  });

  // Animate sections when they come into view
  useEffect(() => {
    const observers = [];

    const createObserver = (id) => {
      const target = document.getElementById(id);
      if (!target) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsVisible(prev => ({ ...prev, [id]: true }));
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(target);
      return observer;
    };

    Object.keys(isVisible).forEach(key => {
      const observer = createObserver(key);
      if (observer) observers.push(observer);
    });

    return () => {
      observers.forEach(observer => {
        if (observer) observer.disconnect();
      });
    };
  }, [isVisible]);

  const teamMembers = [
    {
      name: "John Doe",
      position: "Asoschisi va CEO",
      image: "https://www.n2growth.com/wp-content/uploads/2019/08/happy-ceo-at-desk.jpg",
      bio: "IT sohasida 15 yillik tajribaga ega mutaxassis."
    },
    {
      name: "Jane Smith",
      position: "Texnik direktor",
      image: "/api/placeholder/100/100",
      bio: "Ilgari Yandex va Google'da ishlagan tajribali dasturchi."
    },
    {
      name: "Liam Brown",
      position: "Marketing direktori",
      image: "/api/placeholder/100/100",
      bio: "Xalqaro marketing sohasida 10 yillik tajriba."
    },
    {
      name: "Kate Wilson",
      position: "Moliya direktori",
      image: "/api/placeholder/100/100",
      bio: "Moliya va investitsiya sohasida 12 yillik tajriba."
    }
  ];

  const partners = [
    "Milliy Bank",
    "UzAuto Motors",
    "Toshkent Savdo Markazi",
    "O'zbekiston Ko'chmas Mulk Agentligi",
    "Samarqand San'at Muzeyi",
    "Texno Plaza"
  ];

  const values = [
    { title: "Shaffoflik", description: "Barcha auksionlar va tranzaktsiyalar ochiq va shaffof tarzda o'tkaziladi." },
    { title: "Ishonchlilik", description: "Foydalanuvchilarning ma'lumotlari va mablag'lari xavfsizligi bizning eng ustuvor vazifamizdir." },
    { title: "Adillik", description: "Barcha ishtirokchilar uchun teng imkoniyatlar va adolatli raqobat sharoitlarini yaratamiz." },
    { title: "Innovatsiya", description: "Doimo yangi texnologiyalar va xizmatlarni joriy etib, foydalanuvchilar tajribasini yaxshilashga intilamiz." }
  ];

  const stats = [
    { number: "50,000+", label: "Foydalanuvchilar" },
    { number: "25,000+", label: "Muvaffaqiyatli auksionlar" },
    { number: "300+", label: "Hamkor tashkilotlar" },
    { number: "3+", label: "Faoliyat yillari" }
  ];

  return (
    <div className="bg-gray-50 mt-[64px]">
      {/* Hero Section */}
      <Box
        className="bg-gradient-to-r from-blue-800 to-blue-500 text-white py-20 relative overflow-hidden"
        id="header"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-64 h-64 rounded-full bg-white opacity-10 -top-10 -left-10"></div>
          <div className="absolute w-96 h-96 rounded-full bg-white opacity-10 -bottom-20 -right-20"></div>
        </div>
        <Container maxWidth="lg" className="relative z-10">
          <div className={`flex flex-col justify-center items-center gap-6 transition-all duration-1000 transform ${isVisible.header ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Typography variant="h2" component="h1" className="font-bold mb-4 text-center">
              Biz haqimizda
            </Typography>
            <Typography variant="h5" className="text-center max-w-2xl mx-auto mb-8">
              O'zbekistondagi eng ishonchli online auksion platformasi
            </Typography>
            <div className="flex justify-center gap-2">
              <Link href="/auctions" className="btn btn-primary">
                Auksionlarga o'tish
              </Link>
              <a href="#" className="btn btn-outline">
                Hamkorlik taklifi
              </a>
            </div>
          </div>
        </Container>
      </Box>

      {/* Our Story */}
      <Container maxWidth="lg" className="py-16">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" className="font-bold mb-4">
              Bizning tarix
            </Typography>
            <Typography paragraph>
              Auction platformasi 2022-yilda tashkil etilgan bo'lib, O'zbekistonda zamonaviy va shaffof savdo tizimini joriy etish maqsadida yaratilgan. Bizning asosiy maqsadimiz sotuvchilar va xaridorlar o'rtasida ishonchli va qulay munosabatlarni ta'minlash, hamda ularning har birining manfaatlarini himoya qilishdir.
            </Typography>
            <Typography paragraph>
              Platformamiz asoschilari - tajribali IT mutaxassislari va biznes vakillari - an'anaviy auksion tizimlarining samarasizligi va cheklovlarini ko'rib, raqamli texnologiyalar yordamida bu jarayonni yanada oson, qulay va hamma uchun ochiq qilishga qaror qildilar.
            </Typography>
            <Typography paragraph>
              Dastlab kichik startup sifatida faoliyat boshlagan kompaniyamiz, bugungi kunda O'zbekistondagi eng yirik va tez rivojlanayotgan online savdo platformalaridan biriga aylandi.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
              <img
                src='https://sun9-33.userapi.com/s/v1/ig2/1y6QRz3_yFe-m1pAfWSNSYhv6olQKpCeyAzuY0kbzfurwgzLONStmqHnc2DFW68kidhRzx_PzuJPv9sIzlsSsdHr.jpg?quality=95&as=32x24,48x36,72x54,108x81,160x120,240x180,360x270,480x360,540x405,640x480,720x540,1080x810,1280x960&from=bu&u=suBS0oW5k1tjeuV-Dj_2E5y9_kFeynDy2aqOQ16r00E&cs=604x453'
                alt="Auction platform team"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <Typography variant="h6" className="text-white font-semibold">
                  2022-yilda tashkil etilgan
                </Typography>
                <Typography variant="body2" className="text-gray-200">
                  O'zbekistonning zamonaviy online auksion platformasi
                </Typography>
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>

      {/* Mission and Values */}
      <Box className="bg-gray-100 py-16" id="mission">
        <Container maxWidth="lg">
          <div className={`flex flex-col items-center justify-center gap-6 transition-all duration-1000 transform ${isVisible.mission ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Typography variant="h4" component="h2" className="font-bold mb-8 text-center">
              Bizning maqsad va qadriyatlar
            </Typography>

            <Box className="mb-12 bg-white p-6 rounded-lg shadow-md">
              <Typography variant="h5" className="font-semibold mb-4 text-blue-800 flex items-center">
                <TimelineIcon className="mr-2" /> Maqsadimiz
              </Typography>
              <Typography paragraph>
                Har bir O'zbekiston fuqarosi uchun online auksionlarda adilona va shaffof ishtirok etish imkoniyatini yaratish, innovatsion texnologiyalar orqali savdo jarayonini yanada qulay va samarali qilish.
              </Typography>
            </Box>

            <Typography variant="h5" className="font-semibold mb-6 text-center">
              Qadriyatlarimiz
            </Typography>

            <Grid container spacing={4}>
              {values.map((value, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent>
                      <Typography variant="h6" className="font-semibold mb-2 text-blue-700">
                        {value.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box className="bg-blue-700 text-white py-16" id="stats">
        <Container maxWidth="lg">
          <div className={`transition-all duration-1000 transform ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box className="text-center">
                    <Typography variant="h3" className="font-bold mb-2">
                      {stat.number}
                    </Typography>
                    <Typography variant="subtitle1">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </div>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <Container maxWidth="lg" className="py-16">
        <Typography variant="h4" component="h2" className="font-bold mb-8 text-center">
          Nima uchun Auction platformasini tanlash kerak?
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <List>
              {[
                { icon: <SecurityIcon />, text: "Qulay va ishonchli: Platformamiz eng zamonaviy xavfsizlik texnologiyalari bilan ta'minlangan, barcha tranzaktsiyalar himoyalangan." },
                { icon: <BusinessIcon />, text: "Keng tanlov: Har kuni yuzlab yangi va noyob takliflar, ko'p turdagi kategoriyalar." },
                { icon: <GroupIcon />, text: "Ekspert qo'llab-quvvatlash: Professional jamoamiz har qanday masalada sizga yordam beradi." }
              ].map((item, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemIcon className="text-blue-600">
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              {[
                { icon: <HandshakeIcon />, text: "Yuqori sifatli hamkorlar: Biz faqat ishonchli sotuvchilar bilan hamkorlik qilamiz." },
                { icon: <CheckCircleIcon />, text: "Qulay narxlar: Raqobatli narxlarda sifatli mahsulot va xizmatlarni topish imkoniyati." },
                { icon: <AccessTimeIcon />, text: "24/7 qo'llab-quvvatlash: Kunu-tun ishlaydigan mijozlar xizmati." }
              ].map((item, index) => (
                <ListItem key={index} alignItems="flex-start">
                  <ListItemIcon className="text-blue-600">
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>

      {/* Team Members */}
      <Box className="bg-gray-100 py-16" id="team">
        <Container maxWidth="lg">
          <div className={`flex flex-col items-center justify-center gap-6 transition-all duration-1000 transform ${isVisible.team ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Typography variant="h4" component="h2" className="font-bold mb-8 text-center">
              Bizning jamoa
            </Typography>
            <Typography paragraph className="text-center max-w-2xl mx-auto mb-12">
              Auction platformasi orqasida tajribali va ishtiyoqli 40 kishidan iborat jamoa turadi. Quyida bizning rahbarlar jamoasi bilan tanishing:
            </Typography>

            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 text-center">
                    <CardMedia
                      component="div"
                      className="h-48 bg-blue-100 relative"
                    >
                      <Avatar
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 absolute left-1/2 top-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-white shadow-lg"
                      />
                    </CardMedia>
                    <CardContent className="pt-16">
                      <Typography variant="h6" className="font-semibold">
                        {member.name}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" className="mb-2">
                        {member.position}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.bio}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </Container>
      </Box>

      {/* Our Partners */}
      <Box className="py-16" id="partners">
        <Container maxWidth="lg">
          <div className={`flex flex-col items-center justify-center gap-6 transition-all duration-1000 transform ${isVisible.partners ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Typography variant="h4" component="h2" className="font-bold mb-8 text-center">
              Bizning hamkorlar
            </Typography>
            <Typography paragraph className="text-center max-w-2xl mx-auto mb-12">
              Biz O'zbekistondagi eng yirik kompaniyalar, davlat muassasalari va xususiy biznes egalari bilan hamkorlik qilamiz.
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {partners.map((partner, index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <Card className="h-full flex items-center justify-center p-4 hover:shadow-md transition-shadow duration-300">
                    <CardContent className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-3 flex items-center justify-center">
                        <BusinessIcon fontSize="large" className="text-gray-500" />
                      </div>
                      <Typography variant="subtitle2" className="font-medium">
                        {partner}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </Container>
      </Box>

      {/* Future Plans */}
      <Box className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16">
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" className="font-bold mb-8 text-center">
            Kelajakdagi rejalarimiz
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box className="bg-white bg-opacity-10 p-6 rounded-lg h-full">
                <Typography variant="h6" className="font-semibold mb-3">
                  Rivojlanish yo'nalishlari
                </Typography>
                <List>
                  {[
                    "Xalqaro bozorlarga chiqish",
                    "Mobil ilovani yanada takomillashtirish",
                    "Yangi to'lov tizimlari va imkoniyatlarni joriy etish"
                  ].map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon className="text-white">
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="bg-white bg-opacity-10 p-6 rounded-lg h-full">
                <Typography variant="h6" className="font-semibold mb-3">
                  Texnologik yangiliklar
                </Typography>
                <List>
                  {[
                    "Sunʼiy intellekt texnologiyalarini auksion jarayonlariga integratsiya qilish",
                    "Yangi kategoriyalarni qo'shish va mavjud platformani kengaytirish",
                    "Foydalanuvchi tajribasini yanada yaxshilash uchun interfeys takomillashtirish"
                  ].map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon className="text-white">
                        <CheckCircleIcon />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box className="py-16" id="contact">
        <Container maxWidth="lg">
          <div className={`transition-all duration-1000 transform ${isVisible.contact ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Typography variant="h4" component="h2" className="font-bold mb-8 text-center">
              Bog'lanish
            </Typography>
            <Typography paragraph className="text-center max-w-2xl mx-auto mb-12">
              Bizga savollaringiz bormi? Biz sizga yordam berishdan mamnun bo'lamiz!
            </Typography>

            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Card className="h-full shadow-md">
                  <CardContent>
                    <Typography variant="h5" className="font-semibold mb-6">
                      Bog'lanish ma'lumotlari
                    </Typography>

                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOnIcon className="text-blue-600" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Manzil"
                          secondary="Toshkent sh., Yunusobod tumani, 4-13"
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon className="text-blue-600" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Telefon"
                          secondary="+998 90 123 45 67"
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon className="text-blue-600" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary="info@auction.uz"
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <AccessTimeIcon className="text-blue-600" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Ish vaqti"
                          secondary="Dushanba-Shanba, 9:00 dan 18:00 gacha"
                        />
                      </ListItem>
                    </List>

                    <Divider className="my-4" />

                    <Typography variant="subtitle1" className="font-medium mb-3">
                      Ijtimoiy tarmoqlarda bizni kuzatib boring:
                    </Typography>

                    <div className="flex space-x-3">
                      {['Facebook', 'Instagram', 'Telegram', 'LinkedIn'].map(social => (
                        <Button
                          key={social}
                          variant="outlined"
                          size="small"
                          className="min-w-0 text-blue-600 border-blue-200"
                        >
                          {social}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="h-full shadow-md bg-gradient-to-br from-blue-50 to-gray-50">
                  <CardContent>
                    <Typography variant="h5" className="font-semibold mb-6">
                      Hamkorlik taklifi
                    </Typography>
                    <Typography paragraph>
                      Bizning platformada sotuvchi bo'lishni yoki boshqa hamkorlik turlarini o'rnatishni xohlaysizmi? Biz bilan bog'laning va biz sizga kerakli barcha ma'lumotlarni taqdim etamiz!
                    </Typography>
                    <a href="#" className="btn btn-primary">
                      Hamkorlik qilish
                    </a>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
        </Container>
      </Box>

      {/* Footer CTA */}
      {/* <Box className="bg-gray-800 text-white py-12 text-center">
        <Container maxWidth="md">
          <Typography variant="h5" className="font-bold mb-4">
            Auction platformasining bir qismi bo'ling
          </Typography>
          <Typography paragraph className="mb-6">
            O'zbekistondagi eng qulay, shaffof va ishonchli online auksion platformasi
          </Typography>
          <Link href="/register" className="btn btn-primary">
            Hozir ro'yxatdan o'ting
          </Link>
        </Container>
      </Box> */}
    </div>
  );
};

export default AboutPage;