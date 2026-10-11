using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace StudioManagement
{
    public class LoginViewModel : INotifyPropertyChanged
    {
        private string _userNumber = "1";
        private string _username = "admin";
        private string _currentDateText;
        private string _currentTimeText;
        private string _currentYearText;
        private bool _isBusy;

        public event PropertyChangedEventHandler PropertyChanged;

        public LoginViewModel()
        {
            UpdateDateTime();
        }

        public string UserNumber
        {
            get => _userNumber;
            set { _userNumber = value; OnPropertyChanged(); }
        }

        public string Username
        {
            get => _username;
            set { _username = value; OnPropertyChanged(); }
        }

        public string CurrentDateText
        {
            get => _currentDateText;
            set { _currentDateText = value; OnPropertyChanged(); }
        }

        public string CurrentTimeText
        {
            get => _currentTimeText;
            set { _currentTimeText = value; OnPropertyChanged(); }
        }

        public string CurrentYearText
        {
            get => _currentYearText;
            set { _currentYearText = value; OnPropertyChanged(); }
        }

        public bool IsBusy
        {
            get => _isBusy;
            set { _isBusy = value; OnPropertyChanged(); }
        }

        public void UpdateDateTime()
        {
            DateTime now = DateTime.Now;
            CurrentDateText = "📅 " + now.ToString("yyyy-MM-dd");
            CurrentTimeText = "⏰ " + now.ToString("hh:mm") + (now.Hour >= 12 ? " م" : " ص");
            CurrentYearText = now.ToString("yyyy");
        }

        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
